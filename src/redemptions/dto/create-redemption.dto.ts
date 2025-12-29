import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRedemptionDto {
  @ApiProperty({
    description: 'Product ID to redeem',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantity to redeem',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Please deliver to my home address',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRedemptionDto {
  @ApiPropertyOptional({
    description: 'Redemption status',
    example: 'approved',
    enum: ['pending', 'approved', 'rejected', 'delivered'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Approved and ready for shipping',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
