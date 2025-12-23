import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimesService } from './animes.service';
import { AnimesController } from './animes.controller';
import { Anime } from './entities/anime.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [AnimesController],
  providers: [AnimesService],
  imports: [TypeOrmModule.forFeature([Anime]), AuthModule],
  exports: [AnimesService, TypeOrmModule],
})
export class AnimesModule {}
