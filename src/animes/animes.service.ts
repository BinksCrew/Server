import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anime } from './entities/anime.entity';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';

@Injectable()
export class AnimesService {
  constructor(
    @InjectRepository(Anime)
    private readonly animeRepository: Repository<Anime>,
  ) {}

  async create(createAnimeDto: CreateAnimeDto) {
    try {
      const anime = this.animeRepository.create(createAnimeDto);
      return await this.animeRepository.save(anime);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll() {
    return await this.animeRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const anime = await this.animeRepository.findOneBy({ id });
    if (!anime) throw new NotFoundException(`Anime with id ${id} not found`);
    return anime;
  }

  async update(id: string, updateAnimeDto: UpdateAnimeDto) {
    const anime = await this.animeRepository.preload({
      id: id,
      ...updateAnimeDto,
    });

    if (!anime) throw new NotFoundException(`Anime with id ${id} not found`);

    try {
      return await this.animeRepository.save(anime);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    const anime = await this.findOne(id);
    await this.animeRepository.remove(anime);
    return { message: 'Anime deleted successfully' };
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new BadRequestException('Please check server logs');
  }
}
