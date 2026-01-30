import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { TableEntity } from '../entities/table.entity';
import { Dish } from '../entities/dish.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, TableEntity, Dish])],
  controllers: [OrdersController],
  providers: [OrdersService, RolesGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
