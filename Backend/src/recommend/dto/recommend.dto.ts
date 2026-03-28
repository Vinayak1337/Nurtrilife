import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecommendDto {
  @ApiProperty({ description: 'Remaining calorie budget (kcal)' })
  remainingCalories: number;

  @ApiProperty({ description: 'Remaining protein target (g)' })
  remainingProtein: number;

  @ApiProperty({ description: 'Remaining carbs target (g)' })
  remainingCarbs: number;

  @ApiProperty({ description: 'Remaining fats target (g)' })
  remainingFats: number;

  @ApiPropertyOptional({ description: 'Meal type hint (breakfast, lunch, dinner, snack)' })
  mealType?: string;
}
