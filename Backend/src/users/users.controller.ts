import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { IUser } from './users.schema';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpsertUserDto } from './dto/upsert-user.dto';

@ApiTags('user')
@ApiBearerAuth('clerk-jwt')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUser(@CurrentUser() userId: string) {
    const user = await this.usersService.findByClerkId(userId);
    return { success: true, data: user ?? null };
  }

  @Post()
  @ApiOperation({ summary: 'Create or update the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User upserted successfully' })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
  async upsertUser(
    @CurrentUser() userId: string,
    @Body() body: UpsertUserDto,
  ) {
    const id = body?.id ?? (body as any)?._id;
    if (!id) throw new BadRequestException('Missing id');

    const data: IUser = {
      _id: id,
      clerkUserId: userId,
      name: body.name,
      email: body.email,
      age: body.age,
      weight: body.weight,
      height: body.height,
      dailyCalorieGoal: body.dailyCalorieGoal ?? 2000,
      dailyProteinGoal: body.dailyProteinGoal ?? 150,
      dailyCarbsGoal: body.dailyCarbsGoal ?? 250,
      dailyFatsGoal: body.dailyFatsGoal ?? 65,
      dailyWaterGoal: body.dailyWaterGoal ?? 2000,
      healthFocus: body.healthFocus ?? [],
      updatedAt: new Date().toISOString(),
    };

    await this.usersService.upsert(data);
    return { success: true };
  }
}
