import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '../entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.create(user.restaurantId, user.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async findByTable(
    @CurrentUser() user: RequestUser,
    @Query('tableId') tableId: string,
  ): Promise<Order[]> {
    return this.ordersService.findByTable(user.restaurantId, tableId);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  async cancel(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<Order> {
    return this.ordersService.cancel(user.restaurantId, id, user.id, user.role);
  }
}
