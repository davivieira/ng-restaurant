import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
  ) {}

  async findAll(restaurantId: string, categoryId?: string): Promise<Dish[]> {
    const where: { restaurantId: string; categoryId?: string } = {
      restaurantId,
    };
    if (categoryId && categoryId.trim() !== '') {
      where.categoryId = categoryId.trim();
    }
    return this.dishRepo.find({
      where,
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async create(restaurantId: string, dto: CreateDishDto): Promise<Dish> {
    const dish = this.dishRepo.create({
      restaurantId,
      name: dto.name.trim(),
      description: dto.description?.trim() ?? null,
      price: String(dto.price),
      categoryId: dto.categoryId ?? null,
      isActive: dto.isActive ?? true,
    });
    return this.dishRepo.save(dish);
  }

  async update(
    restaurantId: string,
    id: string,
    dto: UpdateDishDto,
  ): Promise<Dish> {
    const dish = await this.dishRepo.findOne({
      where: { id, restaurantId },
      relations: ['category'],
    });
    if (!dish) {
      throw new NotFoundException('Dish not found');
    }
    if (dto.name !== undefined) dish.name = dto.name.trim();
    if (dto.description !== undefined)
      dish.description = dto.description?.trim() ?? null;
    if (dto.price !== undefined) dish.price = String(dto.price);
    if (dto.categoryId !== undefined) dish.categoryId = dto.categoryId ?? null;
    if (dto.isActive !== undefined) dish.isActive = dto.isActive;
    return this.dishRepo.save(dish);
  }

  async remove(restaurantId: string, id: string): Promise<void> {
    const result = await this.dishRepo.delete({ id, restaurantId });
    if (result.affected === 0) {
      throw new NotFoundException('Dish not found');
    }
  }
}
