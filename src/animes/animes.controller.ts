import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnimesService } from './animes.service';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Animes')
@Controller('animes')
export class AnimesController {
  constructor(private readonly animesService: AnimesService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Create a new anime' })
  create(@Body() createAnimeDto: CreateAnimeDto) {
    return this.animesService.create(createAnimeDto);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all animes' })
  findAll() {
    return this.animesService.findAll();
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get an anime by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animesService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Update an anime' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnimeDto: UpdateAnimeDto,
  ) {
    return this.animesService.update(id, updateAnimeDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Delete an anime' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.animesService.remove(id);
  }
}
