import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  imports: [UsersModule],
})
export class LeaderboardModule {}
