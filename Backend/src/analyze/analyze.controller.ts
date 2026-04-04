import { Controller, Post, Body, BadRequestException, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleGenAI } from '@google/genai';
import { AnalyzeFoodDto } from './dto/analyze-food.dto';
import { CurrentUser } from '../auth/current-user.decorator';

const ANALYSIS_PROMPT = `Analyze this food image and provide detailed nutritional information.

Return ONLY a valid JSON object with this exact structure (no markdown, no backticks, no extra text):
{
  "foodName": "string (name of the food item or dish)",
  "description": "string (1-2 sentence description of what you see)",
  "servingSize": "string (estimated serving size, e.g. '1 plate (~350g)')",
  "calories": number (total calories as integer),
  "protein": number (grams, one decimal place),
  "carbs": number (grams, one decimal place),
  "fats": number (grams, one decimal place),
  "fiber": number (grams, one decimal place),
  "sugar": number (grams, one decimal place),
  "sodium": number (milligrams as integer),
  "ingredients": ["string array of main visible ingredients"],
  "mealType": "breakfast" | "lunch" | "dinner" | "snack",
  "confidence": "high" | "medium" | "low"
}

Guidelines:
- Base estimates on typical restaurant or home-cooked serving sizes
- If you cannot clearly identify the food, still return valid JSON with your best estimate and confidence: "low"
- mealType should be based on the food type, not time of day
- sodium should be in milligrams (mg)
- All numeric values must be numbers, not strings
- If multiple items are present, provide totals and name the food descriptively`;

@ApiTags('analyze')
@ApiBearerAuth('clerk-jwt')
@Controller('analyze')
export class AnalyzeController {
  @Post()
  @ApiOperation({ summary: 'Analyze a food image using Gemini AI' })
  @ApiResponse({ status: 200, description: 'Nutritional analysis result' })
  @ApiResponse({ status: 400, description: 'Missing imageBase64' })
  async analyzeFood(@CurrentUser() _userId: string, @Body() body: AnalyzeFoodDto) {
    const { imageBase64 } = body;
    if (!imageBase64) throw new BadRequestException('Missing imageBase64');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { text: ANALYSIS_PROMPT },
              { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
            ],
          },
        ],
      });

      const text = (response.text ?? '').trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();

      const raw = JSON.parse(text);

      return {
        success: true,
        data: {
          foodName: String(raw.foodName || 'Unknown Food'),
          description: String(raw.description || ''),
          servingSize: String(raw.servingSize || '1 serving'),
          calories: Math.round(Number(raw.calories) || 0),
          protein: Number((Number(raw.protein) || 0).toFixed(1)),
          carbs: Number((Number(raw.carbs) || 0).toFixed(1)),
          fats: Number((Number(raw.fats) || 0).toFixed(1)),
          fiber: Number((Number(raw.fiber) || 0).toFixed(1)),
          sugar: Number((Number(raw.sugar) || 0).toFixed(1)),
          sodium: Math.round(Number(raw.sodium) || 0),
          ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
          mealType: ['breakfast', 'lunch', 'dinner', 'snack'].includes(raw.mealType)
            ? raw.mealType
            : 'snack',
          confidence: ['high', 'medium', 'low'].includes(raw.confidence)
            ? raw.confidence
            : 'medium',
        },
      };
    } catch (error: any) {
      // Gemini quota exhausted or rate-limited — surface as 429 so the client
      // can show a user-friendly message instead of a generic 500.
      const isQuotaError =
        error?.status === 'RESOURCE_EXHAUSTED' ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota') ||
        error?.code === 429;

      if (isQuotaError) {
        console.warn('[AnalyzeController] Gemini quota exceeded:', error.message);
        throw new HttpException(
          'AI analysis is temporarily unavailable — free-tier quota exhausted. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      console.error('[AnalyzeController]', error.message);
      throw new InternalServerErrorException('Failed to analyze food image. Please try again.');
    }
  }
}
