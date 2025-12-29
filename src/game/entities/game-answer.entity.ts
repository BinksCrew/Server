import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { GameSession } from './game-session.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('game_answers')
export class GameAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GameSession, (session) => session.answers)
  session: GameSession;

  @ManyToOne(() => Question, (question) => question.id)
  question: Question;

  @Column('text')
  userAnswer: string;

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ default: 0 })
  pointsEarned: number;

  @CreateDateColumn()
  answeredAt: Date;
}
