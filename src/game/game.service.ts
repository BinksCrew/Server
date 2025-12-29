import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GameSession } from './entities/game-session.entity';
import { GameAnswer } from './entities/game-answer.entity';
import { Question } from '../questions/entities/question.entity';
import { User } from '../users/entities/user.entity';
import { AnswerQuestionDto } from './dto/answer-question.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
    @InjectRepository(GameAnswer)
    private readonly gameAnswerRepository: Repository<GameAnswer>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async startGame(userId: string, questionCount: number = 10) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const session = this.gameSessionRepository.create({
      user,
      totalQuestions: questionCount,
    });

    return this.gameSessionRepository.save(session);
  }

  async answerQuestion(
    userId: string,
    sessionId: string,
    answerDto: AnswerQuestionDto,
  ) {
    const session = await this.gameSessionRepository.findOne({
      where: { id: sessionId, user: { id: userId } },
      relations: ['user'],
    });

    if (!session) throw new NotFoundException('Game session not found');

    if (session.isCompleted) {
      throw new BadRequestException('Game session is already completed');
    }

    const question = await this.questionRepository.findOne({
      where: { id: answerDto.questionId },
      select: ['id', 'correctAnswer'],
    });

    if (!question) throw new NotFoundException('Question not found');

    const isCorrect =
      question.correctAnswer.toLowerCase().trim() ===
      answerDto.answer.toLowerCase().trim();

    const pointsEarned = isCorrect ? 10 : 0; // 10 points per correct answer

    // Use transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create answer record
      const gameAnswer = queryRunner.manager.create(GameAnswer, {
        session,
        question,
        userAnswer: answerDto.answer,
        isCorrect,
        pointsEarned,
      });

      await queryRunner.manager.save(GameAnswer, gameAnswer);

      // Update session
      session.correctAnswers += isCorrect ? 1 : 0;
      session.pointsEarned += pointsEarned;
      await queryRunner.manager.save(GameSession, session);

      // Update user points
      await queryRunner.manager.increment(
        User,
        { id: userId },
        'points',
        pointsEarned,
      );

      await queryRunner.commitTransaction();

      return {
        isCorrect,
        pointsEarned,
        correctAnswer: isCorrect ? undefined : question.correctAnswer,
        sessionProgress: {
          answered:
            session.correctAnswers +
            (session.totalQuestions - session.correctAnswers - 1), // approximate
          total: session.totalQuestions,
          pointsEarned: session.pointsEarned,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getGameStats(userId: string) {
    const sessions = await this.gameSessionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const totalGames = sessions.length;
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalPoints = sessions.reduce((sum, s) => sum + s.pointsEarned, 0);

    return {
      totalGames,
      totalCorrect,
      totalPoints,
      averageScore: totalGames > 0 ? totalCorrect / totalGames : 0,
      recentSessions: sessions,
    };
  }

  async endGame(sessionId: string, userId: string) {
    const session = await this.gameSessionRepository.findOne({
      where: { id: sessionId, user: { id: userId } },
    });

    if (!session) throw new NotFoundException('Game session not found');

    session.isCompleted = true;
    return this.gameSessionRepository.save(session);
  }

  async getAllGameSessions() {
    return this.gameSessionRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        totalQuestions: true,
        correctAnswers: true,
        pointsEarned: true,
        isCompleted: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          username: true,
          fullName: true,
        },
      },
    });
  }
}
