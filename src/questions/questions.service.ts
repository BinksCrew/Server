import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const { animeId, ...rest } = createQuestionDto;
    const question = this.questionRepository.create({
      ...rest,
      anime: { id: animeId },
    } as Partial<Question>);
    return this.questionRepository.save(question);
  }

  async findAll(animeId?: string) {
    const query = this.questionRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.anime', 'a')
      .select([
        'q.id',
        'q.question',
        'q.type',
        'q.options',
        'q.correctAnswer',
        'q.createdAt',
        'q.updatedAt',
        'a.id',
        'a.name',
      ]);

    if (animeId) {
      query.where('a.id = :animeId', { animeId });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const question = await this.questionRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.anime', 'a')
      .select([
        'q.id',
        'q.question',
        'q.type',
        'q.options',
        'q.correctAnswer',
        'q.createdAt',
        'q.updatedAt',
        'a.id',
        'a.name',
      ])
      .where('q.id = :id', { id })
      .getOne();

    if (!question)
      throw new NotFoundException(`Question with id ${id} not found`);
    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const { animeId, ...rest } = updateQuestionDto;
    const data: any = { ...rest };
    if (animeId) {
      data.anime = { id: animeId };
    }

    const question = await this.questionRepository.preload({
      id,
      ...data,
    });
    if (!question)
      throw new NotFoundException(`Question with id ${id} not found`);
    return this.questionRepository.save(question);
  }

  async remove(id: string) {
    const question = await this.findOne(id);
    return this.questionRepository.remove(question);
  }

  async checkAnswer(id: string, userAnswer: string) {
    const question = await this.questionRepository.findOne({
      where: { id },
      select: ['id', 'correctAnswer'], // Explicitly select correctAnswer as it is hidden by default
    });

    if (!question)
      throw new NotFoundException(`Question with id ${id} not found`);

    const qa = question.correctAnswer?.toString().toLowerCase().trim();
    const ua = userAnswer?.toString().toLowerCase().trim();
    const isCorrect = qa === ua;

    return {
      correct: isCorrect, // legacy key
      isCorrect,
      message: isCorrect ? '¡Acertaste!' : 'Respuesta incorrecta',
      correctAnswer: question.correctAnswer,
    };
  }

  async getRandomQuestions(count: number) {
    return this.questionRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.anime', 'a')
      .select([
        'q.id',
        'q.question',
        'q.type',
        'q.options',
        // 'q.correctAnswer', // Removed for security - don't send correct answers to client
        'a.id',
        'a.name',
      ])
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }
}
