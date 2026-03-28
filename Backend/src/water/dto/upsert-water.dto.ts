import { ApiProperty } from '@nestjs/swagger';

export class WaterEntryDto {
  @ApiProperty() id: string;
  @ApiProperty({ description: 'Amount in millilitres' }) amount: number;
  @ApiProperty({ description: 'Date (YYYY-MM-DD)' }) date: string;
  @ApiProperty({ required: false }) createdAt?: string;
}

export class UpsertWaterDto {
  @ApiProperty({ type: WaterEntryDto })
  entry: WaterEntryDto;
}
