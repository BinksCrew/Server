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
    const question = this.questionRepository.create(createQuestionDto);
    return this.questionRepository.save(question);
  }

  async findAll() {
    return this.questionRepository.createQueryBuilder('question')
      .addSelect('question.correctAnswer')
      .getMany();
  }

  async findOne(id: string) {
    const question = await this.questionRepository.findOneBy({ id });
    if (!question) throw new NotFoundException(`Question with id ${id} not found`);
    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.questionRepository.preload({
      id,
      ...updateQuestionDto,
    });
    if (!question) throw new NotFoundException(`Question with id ${id} not found`);
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

    if (!question) throw new NotFoundException(`Question with id ${id} not found`);

    const isCorrect = question.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();

    return {
      correct: isCorrect,
      message: isCorrect ? '¡Acertaste!' : 'Respuesta incorrecta',
      correctAnswer: isCorrect ? undefined : question.correctAnswer, // Optionally reveal answer if wrong? Maybe better not to for now, or yes.
    };
  }
}
