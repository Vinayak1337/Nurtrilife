import { Controller, Get, Post, Delete, Body, Query, Param, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { WaterService } from './water.service';
import { IWaterEntry } from './water.schema';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpsertWaterDto } from './dto/upsert-water.dto';

@ApiTags('water')
@ApiBearerAuth('clerk-jwt')
@Controller('water')
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @Get()
  @ApiOperation({ summary: 'Get water entries for a date or date range' })
  @ApiQuery({ name: 'date', required: false, description: 'Single date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Range start (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Range end (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Water entries returned' })
  async getWater(
    @CurrentUser() userId: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    let entries: IWaterEntry[];
    if (startDate && endDate) {
      if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate))
        throw new BadRequestException('startDate and endDate must be YYYY-MM-DD');
      entries = await this.waterService.findByDateRange(userId, startDate, endDate);
    } else if (date) {
      if (!DATE_RE.test(date)) throw new BadRequestException('date must be YYYY-MM-DD');
      entries = await this.waterService.findByDate(userId, date);
    } else {
      throw new BadRequestException('Provide date or startDate+endDate');
    }
    return {
      success: true,
      data: entries.map((e) => ({
        id: e._id,
        amount: e.amount,
        date: e.date,
        createdAt: e.createdAt,
      })),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a water intake entry' })
  @ApiResponse({ status: 200, description: 'Water entry upserted' })
  @ApiResponse({ status: 400, description: 'Missing entry id' })
  async upsertWater(
    @CurrentUser() userId: string,
    @Body() body: UpsertWaterDto,
  ) {
    const entry = body.entry as Record<string, any>;
    const id = entry?.id ?? entry?._id;
    if (!id) throw new BadRequestException('Missing entry id');

    const now = new Date().toISOString();
    const doc: IWaterEntry = {
      _id: id,
      clerkUserId: userId,
      amount: entry.amount,
      date: entry.date,
      createdAt: entry.createdAt ?? now,
      updatedAt: now,
    };

    await this.waterService.upsert(doc);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a water entry by ID' })
  @ApiResponse({ status: 200, description: 'Water entry deleted' })
  async deleteWater(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    if (!id) throw new BadRequestException('Missing entry id');
    await this.waterService.delete(id, userId);
    return { success: true };
  }
}
