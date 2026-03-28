import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpsertBadgeDto } from './dto/upsert-badge.dto';

@ApiTags('badges')
@ApiBearerAuth('clerk-jwt')
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all unlocked badge IDs for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Badge IDs returned' })
  async getBadges(@CurrentUser() userId: string) {
    const badgeIds = await this.badgesService.findByClerkId(userId);
    return { success: true, data: badgeIds };
  }

  @Post()
  @ApiOperation({ summary: 'Unlock a badge for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Badge upserted' })
  @ApiResponse({ status: 400, description: 'Missing badgeId' })
  async upsertBadge(
    @CurrentUser() userId: string,
    @Body() body: UpsertBadgeDto,
  ) {
    const { badgeId } = body;
    if (!badgeId) throw new BadRequestException('Missing badgeId');
    await this.badgesService.upsert(userId, badgeId);
    return { success: true };
  }
}
