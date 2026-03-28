import { ApiProperty } from '@nestjs/swagger';

export class MealDto {
  @ApiProperty() id: string;
  @ApiProperty() foodName: string;
  @ApiProperty() date: string;
  @ApiProperty() calories: number;
  @ApiProperty() protein: number;
  @ApiProperty() carbs: number;
  @ApiProperty() fats: number;
  @ApiProperty() fiber: number;
  @ApiProperty() sugar: number;
  @ApiProperty() sodium: number;
  @ApiProperty() mealType: string;
  @ApiProperty({ required: false }) photoUri?: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ type: [String], required: false }) ingredients?: string[];
  @ApiProperty({ required: false }) createdAt?: string;
}

export class UpsertMealDto {
  @ApiProperty({ type: MealDto })
  meal: MealDto;
}
