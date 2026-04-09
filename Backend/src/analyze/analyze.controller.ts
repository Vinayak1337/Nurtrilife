import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
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
  async analyzeFood(
    @CurrentUser() _userId: string,
    @Body() body: AnalyzeFoodDto,
  ) {
    const { imageBase64 } = body;
    if (!imageBase64) throw new BadRequestException('Missing imageBase64');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
              { text: ANALYSIS_PROMPT },
            ],
          },
        ],
      });

      const text = (response.text ?? '')
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();

      const raw = JSON.parse(text) as {
        foodName?: unknown;
        description?: unknown;
        servingSize?: unknown;
        calories?: unknown;
        protein?: unknown;
        carbs?: unknown;
        fats?: unknown;
        fiber?: unknown;
        sugar?: unknown;
        sodium?: unknown;
        ingredients?: unknown;
        mealType?: unknown;
        confidence?: unknown;
      };

      return {
        success: true,
        data: {
          foodName:
            typeof raw.foodName === 'string' ? raw.foodName : 'Unknown Food',
          description:
            typeof raw.description === 'string' ? raw.description : '',
          servingSize:
            typeof raw.servingSize === 'string' ? raw.servingSize : '1 serving',
          calories: Math.round(Number(raw.calories) || 0),
          protein: Number((Number(raw.protein) || 0).toFixed(1)),
          carbs: Number((Number(raw.carbs) || 0).toFixed(1)),
          fats: Number((Number(raw.fats) || 0).toFixed(1)),
          fiber: Number((Number(raw.fiber) || 0).toFixed(1)),
          sugar: Number((Number(raw.sugar) || 0).toFixed(1)),
          sodium: Math.round(Number(raw.sodium) || 0),
          ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
          mealType:
            typeof raw.mealType === 'string' &&
            ['breakfast', 'lunch', 'dinner', 'snack'].includes(raw.mealType)
              ? raw.mealType
              : 'snack',
          confidence:
            typeof raw.confidence === 'string' &&
            ['high', 'medium', 'low'].includes(raw.confidence)
              ? raw.confidence
              : 'medium',
        },
      };
    } catch (error: unknown) {
      const err = error as { status?: string; message?: string; code?: number };
      const isQuotaError =
        err?.status === 'RESOURCE_EXHAUSTED' ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('quota') ||
        err?.code === 429;

      if (isQuotaError) {
        console.warn('[AnalyzeController] Gemini quota exceeded:', err.message);
        throw new HttpException(
          'AI analysis is temporarily unavailable — free-tier quota exhausted. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      console.error('[AnalyzeController]', JSON.stringify(error));
      throw new InternalServerErrorException(
        'Failed to analyze food image. Please try again.',
      );
    }
  }
}
