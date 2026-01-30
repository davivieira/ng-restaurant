import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { Dish } from '../entities/dish.entity';
import { CategoriesController } from './categories.controller';
import { DishesController } from './dishes.controller';
import { CategoriesService } from './categories.service';
import { DishesService } from './dishes.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Dish])],
  controllers: [CategoriesController, DishesController],
  providers: [CategoriesService, DishesService, RolesGuard],
  exports: [CategoriesService, DishesService],
})
export class MenuModule {}
