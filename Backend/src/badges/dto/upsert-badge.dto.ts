import { ApiProperty } from '@nestjs/swagger';

export class UpsertBadgeDto {
  @ApiProperty({ description: 'Badge identifier (e.g. first_bite, week_warrior)' })
  badgeId: string;
}
