import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { Auth } from './auth/decorators/auth.decorator';
import { ValidRoles } from './auth/interfaces/valid-roles';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      database: this.dataSource.isInitialized ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @Auth(ValidRoles.admin)
  async getStats() {
    const usersCount = await this.dataSource.query('SELECT COUNT(*) as count FROM users');
    const animesCount = await this.dataSource.query('SELECT COUNT(*) as count FROM animes');
    const questionsCount = await this.dataSource.query('SELECT COUNT(*) as count FROM questions');

    return {
      users: parseInt(usersCount[0].count),
      animes: parseInt(animesCount[0].count),
      questions: parseInt(questionsCount[0].count),
    };
  }
}
