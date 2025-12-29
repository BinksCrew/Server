import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getGlobalLeaderboard(limit: number = 50) {
    return this.userRepository.find({
      select: ['id', 'username', 'fullName', 'points', 'photo_url'],
      where: { isActive: true },
      order: { points: 'DESC' },
      take: limit,
    });
  }

  async getWeeklyLeaderboard(limit: number = 50) {
    // For now, return global leaderboard
    // In a real implementation, you'd track weekly points separately
    // or calculate based on recent game sessions
    return this.getGlobalLeaderboard(limit);
  }

  async getUserRank(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'points'],
    });

    if (!user) return null;

    // Count users with more points than this user
    const higherRankCount = await this.userRepository.count({
      where: {
        points: user.points > 0 ? user.points + 1 : user.points,
        isActive: true,
      },
    });

    return {
      userId: user.id,
      points: user.points,
      rank: higherRankCount + 1,
    };
  }
}
