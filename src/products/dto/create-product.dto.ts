import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Naruto Action Figure',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality action figure of Naruto Uzumaki',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Points required to purchase',
    example: 500,
  })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/naruto-figure.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Naruto Action Figure',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality action figure of Naruto Uzumaki',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Points required to purchase',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  price?: number;

  @ApiPropertyOptional({
    description: 'Available stock quantity',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/naruto-figure.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
