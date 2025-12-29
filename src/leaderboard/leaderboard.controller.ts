import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { Auth } from '../auth/decorators/auth.decorator';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get global leaderboard' })
  getGlobalLeaderboard(@Query('limit') limit?: string) {
    const limitNum = parseInt(limit || '50');
    return this.leaderboardService.getGlobalLeaderboard(limitNum);
  }

  @Get('weekly')
  @Auth()
  @ApiOperation({ summary: 'Get weekly leaderboard' })
  getWeeklyLeaderboard(@Query('limit') limit?: string) {
    const limitNum = parseInt(limit || '50');
    return this.leaderboardService.getWeeklyLeaderboard(limitNum);
  }

  @Get('rank')
  @Auth()
  @ApiOperation({ summary: 'Get current user rank' })
  getUserRank(@Req() req: Request) {
    const user = req.user as User;
    return this.leaderboardService.getUserRank(user.id);
  }
}
