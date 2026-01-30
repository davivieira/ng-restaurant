import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(restaurantId: string): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { restaurantId },
      order: { name: 'ASC' },
    });
  }

  async create(
    restaurantId: string,
    dto: CreateCategoryDto,
  ): Promise<Category> {
    const category = this.categoryRepo.create({
      restaurantId,
      name: dto.name.trim(),
    });
    return this.categoryRepo.save(category);
  }

  async update(
    restaurantId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, restaurantId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (dto.name !== undefined) {
      category.name = dto.name.trim();
    }
    return this.categoryRepo.save(category);
  }

  async remove(restaurantId: string, id: string): Promise<void> {
    const result = await this.categoryRepo.delete({ id, restaurantId });
    if (result.affected === 0) {
      throw new NotFoundException('Category not found');
    }
  }
}
