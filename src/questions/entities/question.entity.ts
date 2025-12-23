import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Anime } from '../../animes/entities/anime.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  question: string;

  @Column('text')
  type: string; // 'multiple-choice', 'true-false', 'open'

  @ManyToOne(() => Anime, (anime) => anime.questions)
  anime: Anime;

  @Column('text', { select: false }) // Hide correct answer from default queries
  correctAnswer: string;

  @Column('text', { array: true, nullable: true })
  options: string[]; // For multiple choice questions

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
