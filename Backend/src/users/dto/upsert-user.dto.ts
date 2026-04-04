import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertUserDto {
  @ApiProperty({ description: 'Local user ID' })
  id: string;

  @ApiProperty({ description: 'User display name' })
  name: string;

  @ApiPropertyOptional({ description: 'Email address' })
  email?: string;

  @ApiPropertyOptional({ description: 'Age in years' })
  age?: number;

  @ApiPropertyOptional({ description: 'Weight in kg' })
  weight?: number;

  @ApiPropertyOptional({ description: 'Height in cm' })
  height?: number;

  @ApiPropertyOptional({ default: 2000, description: 'Daily calorie goal (kcal)' })
  dailyCalorieGoal?: number;

  @ApiPropertyOptional({ default: 150, description: 'Daily protein goal (g)' })
  dailyProteinGoal?: number;

  @ApiPropertyOptional({ default: 250, description: 'Daily carbs goal (g)' })
  dailyCarbsGoal?: number;

  @ApiPropertyOptional({ default: 65, description: 'Daily fats goal (g)' })
  dailyFatsGoal?: number;

  @ApiPropertyOptional({ default: 2500, description: 'Daily water goal (ml)' })
  dailyWaterGoal?: number;

  @ApiPropertyOptional({ type: [String], description: 'Health focus areas' })
  healthFocus?: string[];

  @ApiPropertyOptional({ default: 0, description: 'Current logging streak (days)' })
  currentStreak?: number;

  @ApiPropertyOptional({ default: 0, description: 'Longest logging streak ever (days)' })
  longestStreak?: number;
}
