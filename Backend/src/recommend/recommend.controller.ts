import { Controller, Post, Body, BadRequestException, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleGenAI } from '@google/genai';
import { RecommendDto } from './dto/recommend.dto';

@ApiTags('recommend')
@ApiBearerAuth('clerk-jwt')
@Controller('recommend')
export class RecommendController {
  @Post()
  @ApiOperation({ summary: 'Get AI meal recommendations based on remaining nutritional targets' })
  @ApiResponse({ status: 200, description: '3 meal suggestions returned' })
  async getRecommendations(@Body() body: RecommendDto) {
    const { remainingCalories, remainingProtein, remainingCarbs, remainingFats, mealType } = body;
    if (remainingCalories == null) throw new BadRequestException('Missing required fields');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      const prompt = `You are a nutrition expert. The user has these remaining daily targets:
- Calories: ${remainingCalories} kcal
- Protein: ${remainingProtein}g
- Carbs: ${remainingCarbs}g
- Fats: ${remainingFats}g

Suggest exactly 3 ${mealType || 'meal'} options that would help meet these remaining goals.
Each suggestion should be a realistic, common food item or simple meal.

Return ONLY a JSON array (no markdown fences) with this structure:
[
  {
    "foodName": "string",
    "emoji": "single food emoji",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "description": "short 1-sentence description"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      let text = response.text?.trim() ?? '[]';
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

      const suggestions = JSON.parse(text);
      return { success: true, data: suggestions };
    } catch (error: any) {
      const isQuotaError =
        error?.status === 'RESOURCE_EXHAUSTED' ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota') ||
        error?.code === 429;

      if (isQuotaError) {
        console.warn('[RecommendController] Gemini quota exceeded');
        throw new HttpException(
          'Recommendations unavailable — AI quota exhausted. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      console.error('[RecommendController]', error.message);
      throw new InternalServerErrorException('Failed to get recommendations.');
    }
  }
}
