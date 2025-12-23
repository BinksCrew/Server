import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ImageUploadService } from '../common/services/image-upload.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  async create(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    try {
      const { password, ...userData } = createUserDto;
      let photo_url: string | null = null;

      if (file) {
        photo_url = await this.imageUploadService.uploadImage(file);
      }

      const user = this.userRepository.create({
        ...userData,
        photo_url,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete (user as any).password;
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.findOne(id);
    const { password, email, ...userData } = updateUserDto; // email changes not allowed

    if (file) {
      userData['photo_url'] = await this.imageUploadService.uploadImage(file);
    }

    if (password) {
      userData['password'] = bcrypt.hashSync(password, 10);
    }

    const updatedUser = await this.userRepository.preload({
      id,
      ...userData,
    });

    if (!updatedUser)
      throw new NotFoundException(`User with id ${id} not found`);

    try {
      await this.userRepository.save(updatedUser);
      delete (updatedUser as any).password;
      return updatedUser;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: `User with id ${id} deleted` };
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        roles: true,
        isActive: true,
      },
    });
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
