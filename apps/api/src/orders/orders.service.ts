import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { TableEntity } from '../entities/table.entity';
import { Dish } from '../entities/dish.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(TableEntity)
    private readonly tableRepo: Repository<TableEntity>,
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
  ) {}

  async create(
    restaurantId: string,
    waiterId: string,
    dto: CreateOrderDto,
  ): Promise<Order> {
    const table = await this.tableRepo.findOne({
      where: { id: dto.tableId, restaurantId },
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    if (dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }
    const dishIds = [...new Set(dto.items.map((i) => i.dishId))];
    const dishes = await this.dishRepo.find({
      where: { id: In(dishIds), restaurantId },
    });
    if (dishes.length !== dishIds.length) {
      throw new BadRequestException(
        'One or more dishes not found or not in your restaurant',
      );
    }
    const order = this.orderRepo.create({
      restaurantId,
      tableId: dto.tableId,
      waiterId,
      status: OrderStatus.PENDING,
    });
    const savedOrder = await this.orderRepo.save(order);
    const items = dto.items.map((item) =>
      this.orderItemRepo.create({
        orderId: savedOrder.id,
        dishId: item.dishId,
        quantity: item.quantity,
        observations: item.observations?.trim() ?? null,
      }),
    );
    await this.orderItemRepo.save(items);
    return this.orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: ['items', 'items.dish', 'table', 'waiter'],
    }) as Promise<Order>;
  }

  async findByTable(restaurantId: string, tableId: string): Promise<Order[]> {
    const table = await this.tableRepo.findOne({
      where: { id: tableId, restaurantId },
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return this.orderRepo.find({
      where: { tableId, restaurantId },
      relations: ['items', 'items.dish', 'waiter'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(
    restaurantId: string,
    orderId: string,
    userId: string,
    userRole: string,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, restaurantId },
      relations: ['items', 'items.dish', 'table', 'waiter'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === OrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot cancel order in progress');
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }
    if (userRole !== 'admin' && order.waiterId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }
}
