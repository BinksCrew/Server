import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  requestBody: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}
