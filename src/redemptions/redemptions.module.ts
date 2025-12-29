import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedemptionsService } from './redemptions.service';
import { RedemptionsController } from './redemptions.controller';
import { Redemption } from './entities/redemption.entity';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [RedemptionsController],
  providers: [RedemptionsService],
  imports: [
    TypeOrmModule.forFeature([Redemption]),
    ProductsModule,
    UsersModule,
  ],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
