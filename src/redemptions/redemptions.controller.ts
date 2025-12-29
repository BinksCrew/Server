import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RedemptionsService } from './redemptions.service';
import {
  CreateRedemptionDto,
  UpdateRedemptionDto,
} from './dto/create-redemption.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@ApiTags('Redemptions')
@Controller('redemptions')
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new redemption request' })
  create(
    @Req() req: Request,
    @Body() createRedemptionDto: CreateRedemptionDto,
  ) {
    const user = req.user as User;
    return this.redemptionsService.create(user.id, createRedemptionDto);
  }

  @Get()
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Get all redemptions (admin only)' })
  findAll() {
    return this.redemptionsService.findAll();
  }

  @Get('history')
  @Auth()
  @ApiOperation({ summary: 'Get current user redemption history' })
  getUserHistory(@Req() req: Request) {
    const user = req.user as User;
    return this.redemptionsService.getUserRedemptions(user.id);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get a redemption by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.redemptionsService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Update redemption status (admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRedemptionDto: UpdateRedemptionDto,
  ) {
    return this.redemptionsService.update(id, updateRedemptionDto);
  }
}
