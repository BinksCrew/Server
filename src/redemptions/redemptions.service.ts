import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Redemption, RedemptionStatus } from './entities/redemption.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import {
  CreateRedemptionDto,
  UpdateRedemptionDto,
} from './dto/create-redemption.dto';

@Injectable()
export class RedemptionsService {
  constructor(
    @InjectRepository(Redemption)
    private readonly redemptionRepository: Repository<Redemption>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, createRedemptionDto: CreateRedemptionDto) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productRepository.findOneBy({
      id: createRedemptionDto.productId,
    });
    if (!product) throw new NotFoundException('Product not found');

    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    if (product.stock < createRedemptionDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const totalPoints = product.price * createRedemptionDto.quantity;

    if (user.points < totalPoints) {
      throw new BadRequestException('Insufficient points');
    }

    // Use transaction for atomic operation
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create redemption record
      const redemption = queryRunner.manager.create(Redemption, {
        user,
        product,
        quantity: createRedemptionDto.quantity,
        totalPoints,
        notes: createRedemptionDto.notes,
      });

      await queryRunner.manager.save(Redemption, redemption);

      // Deduct points from user
      await queryRunner.manager.decrement(
        User,
        { id: userId },
        'points',
        totalPoints,
      );

      // Reduce product stock
      await queryRunner.manager.decrement(
        Product,
        { id: product.id },
        'stock',
        createRedemptionDto.quantity,
      );

      await queryRunner.commitTransaction();

      return redemption;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId?: string) {
    const where = userId ? { user: { id: userId } } : {};
    return this.redemptionRepository.find({
      where,
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const redemption = await this.redemptionRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!redemption) {
      throw new NotFoundException(`Redemption with id ${id} not found`);
    }

    return redemption;
  }

  async update(id: string, updateRedemptionDto: UpdateRedemptionDto) {
    const redemption = await this.redemptionRepository.preload({
      id,
      ...updateRedemptionDto,
      status: updateRedemptionDto.status as RedemptionStatus,
    });

    if (!redemption) {
      throw new NotFoundException(`Redemption with id ${id} not found`);
    }

    return this.redemptionRepository.save(redemption);
  }

  async getUserRedemptions(userId: string) {
    return this.redemptionRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }
}
