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
    });
    return this.questionRepository.save(question);
  }

  async findAll(animeId?: string) {
    const where = animeId ? { anime: { id: animeId } } : {};
    return this.questionRepository.find({
      where,
      relations: ['anime'],
      select: {
        id: true,
        question: true,
        type: true,
        options: true,
        correctAnswer: true,
        createdAt: true,
        updatedAt: true,
        anime: {
          id: true,
          name: true,
        },
      },
    });
  }

  async findOne(id: string) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['anime'],
    });
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

    const isCorrect =
      question.correctAnswer.toLowerCase().trim() ===
      userAnswer.toLowerCase().trim();

    return {
      correct: isCorrect,
      message: isCorrect ? '¡Acertaste!' : 'Respuesta incorrecta',
      correctAnswer: isCorrect ? undefined : question.correctAnswer, // Optionally reveal answer if wrong? Maybe better not to for now, or yes.
    };
  }
}
