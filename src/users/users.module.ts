import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ImageUploadService } from '../common/services/image-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HttpModule],
  controllers: [UsersController],
  providers: [UsersService, ImageUploadService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
