import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { IMeal } from './meals.schema';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpsertMealDto } from './dto/upsert-meal.dto';

@ApiTags('meals')
@ApiBearerAuth('clerk-jwt')
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  @ApiOperation({ summary: 'Get meals for a date or date range' })
  @ApiQuery({ name: 'date', required: false, description: 'Single date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Range start (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Range end (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Meals returned' })
  async getMeals(
    @CurrentUser() userId: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    let meals: IMeal[];
    if (startDate && endDate) {
      if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate))
        throw new BadRequestException('startDate and endDate must be YYYY-MM-DD');
      meals = await this.mealsService.findByDateRange(userId, startDate, endDate);
    } else if (date) {
      if (!DATE_RE.test(date)) throw new BadRequestException('date must be YYYY-MM-DD');
      meals = await this.mealsService.findByDate(userId, date);
    } else {
      throw new BadRequestException('Provide date or startDate+endDate');
    }

    return { success: true, data: meals.map(docToMeal) };
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a meal entry' })
  @ApiResponse({ status: 200, description: 'Meal upserted' })
  @ApiResponse({ status: 400, description: 'Missing meal id' })
  async upsertMeal(
    @CurrentUser() userId: string,
    @Body() body: UpsertMealDto,
  ) {
    const meal = body.meal as Record<string, any>;
    const id = meal?.id ?? meal?._id;
    if (!id) throw new BadRequestException('Missing meal id');

    const doc: IMeal = {
      _id: id,
      clerkUserId: userId,
      photoUri: meal.photoUri ?? '',
      foodName: meal.foodName,
      description: meal.description ?? '',
      calories: meal.calories ?? 0,
      protein: meal.protein ?? 0,
      carbs: meal.carbs ?? 0,
      fats: meal.fats ?? 0,
      fiber: meal.fiber ?? 0,
      sugar: meal.sugar ?? 0,
      sodium: meal.sodium ?? 0,
      ingredients: meal.ingredients ?? [],
      mealType: meal.mealType ?? 'snack',
      date: meal.date,
      createdAt: meal.createdAt ?? new Date().toISOString(),
    };

    await this.mealsService.upsert(doc);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal by ID' })
  @ApiResponse({ status: 200, description: 'Meal deleted' })
  async deleteMeal(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    if (!id) throw new BadRequestException('Missing meal id');
    await this.mealsService.delete(id, userId);
    return { success: true };
  }
}

function docToMeal(doc: IMeal) {
  return {
    id: doc._id,
    photoUri: doc.photoUri ?? '',
    foodName: doc.foodName,
    description: doc.description ?? '',
    calories: doc.calories ?? 0,
    protein: doc.protein ?? 0,
    carbs: doc.carbs ?? 0,
    fats: doc.fats ?? 0,
    fiber: doc.fiber ?? 0,
    sugar: doc.sugar ?? 0,
    sodium: doc.sodium ?? 0,
    ingredients: doc.ingredients ?? [],
    mealType: doc.mealType,
    date: doc.date,
    createdAt: doc.createdAt,
  };
}
