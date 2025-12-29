import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { GameService } from './game.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@ApiTags('Game')
@Controller('game')
@UseGuards(ThrottlerGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  @Auth()
  @ApiOperation({ summary: 'Start a new game session' })
  startGame(@Req() req: Request, @Query('questions') questionCount?: string) {
    const user = req.user as User;
    const count = parseInt(questionCount || '10');
    return this.gameService.startGame(user.id, count);
  }

  @Post('answer')
  @Auth()
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 answers per minute
  @ApiOperation({
    summary: 'Submit an answer for a question in the current game',
  })
  answerQuestion(
    @Req() req: Request,
    @Body() answerDto: AnswerQuestionDto,
    @Query('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    const user = req.user as User;
    return this.gameService.answerQuestion(user.id, sessionId, answerDto);
  }

  @Post(':sessionId/end')
  @Auth()
  @ApiOperation({ summary: 'End a game session' })
  @ApiParam({ name: 'sessionId', description: 'The ID of the game session' })
  endGame(
    @Req() req: Request,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    const user = req.user as User;
    return this.gameService.endGame(sessionId, user.id);
  }

  @Get('stats')
  @Auth()
  @ApiOperation({ summary: 'Get user game statistics' })
  getGameStats(@Req() req: Request) {
    const user = req.user as User;
    return this.gameService.getGameStats(user.id);
  }

  @Get('sessions')
  @Auth()
  @ApiOperation({ summary: 'Get all game sessions (admin)' })
  getAllGameSessions(@Req() req: Request) {
    // TODO: Add admin role check
    return this.gameService.getAllGameSessions();
  }
}
