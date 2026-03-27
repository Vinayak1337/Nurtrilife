import { GoogleGenAI } from '@google/genai';
import dbConnect from '../../utils/db';
import { NutritionLog } from '../../models/NutritionLog';

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

export async function POST(req: Request) {
  try {
    const { imageBase64, userId } = await req.json();

    if (!imageBase64 || !userId) {
      return new Response(JSON.stringify({ error: 'Missing imageBase64 or userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { text: ANALYSIS_PROMPT },
            {
              inlineData: {
                data: imageBase64,
                mimeType: 'image/jpeg',
              },
            },
          ],
        },
      ],
    });

    const text = (response.text ?? '').trim();

    // Strip markdown fences if model added them despite the prompt
    const jsonText = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    const raw = JSON.parse(jsonText);

    const nutritionData = {
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
    };

    // Persist to MongoDB — non-critical, don't fail the response if this errors
    try {
      await dbConnect();
      const today = new Date().toISOString().split('T')[0];
      await NutritionLog.create({
        userId,
        date: today,
        foodName: nutritionData.foodName,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fats: nutritionData.fats,
      });
    } catch (dbError) {
      console.error('[analyze+api] MongoDB save failed (non-fatal):', dbError instanceof Error ? dbError.message : dbError);
    }

    return new Response(JSON.stringify({ success: true, data: nutritionData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[analyze+api] Error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
