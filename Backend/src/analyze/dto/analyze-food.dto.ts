import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeFoodDto {
  @ApiProperty({ description: 'Base64-encoded JPEG image of the food' })
  imageBase64: string;
}
