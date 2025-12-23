import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Create a new question' })
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all questions' })
  findAll(@Query('animeId') animeId?: string) {
    return this.questionsService.findAll(animeId);
  }

  @Get('random')
  @Auth()
  @ApiOperation({ summary: 'Get random questions for quiz' })
  getRandom(@Query('count') count: string) {
    const countNum = parseInt(count) || 10;
    return this.questionsService.getRandomQuestions(countNum);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get a question by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Update a question' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Delete a question' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionsService.remove(id);
  }

  @Post(':id/answer')
  @Auth()
  @ApiOperation({ summary: 'Submit an answer for a question' })
  checkAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() answerQuestionDto: AnswerQuestionDto,
  ) {
    return this.questionsService.checkAnswer(id, answerQuestionDto.answer);
  }
}
