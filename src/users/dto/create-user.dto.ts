import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  cedula: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  fullName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  username?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  phone?: string;
}
