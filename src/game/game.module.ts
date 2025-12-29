import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameSession } from './entities/game-session.entity';
import { GameAnswer } from './entities/game-answer.entity';
import { QuestionsModule } from '../questions/questions.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [GameController],
  providers: [GameService],
  imports: [
    TypeOrmModule.forFeature([GameSession, GameAnswer]),
    QuestionsModule,
    UsersModule,
  ],
  exports: [GameService],
})
export class GameModule {}
