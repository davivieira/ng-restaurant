import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../entities/user.entity';
import type { RequestUser } from '../auth/current-user.decorator';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from '../entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  const mockUser: RequestUser = {
    id: 'waiter-1',
    email: 'waiter@test.com',
    role: UserRole.WAITER,
    restaurantId: 'rest-1',
    name: 'Waiter',
  };

  const mockOrder: Order = {
    id: 'order-1',
    restaurantId: 'rest-1',
    tableId: 'table-1',
    waiterId: 'waiter-1',
    status: OrderStatus.PENDING,
    items: [],
    createdAt: new Date(),
  } as Order;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn(),
            findByTable: jest.fn(),
            cancel: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(OrdersController);
    service = module.get(OrdersService);
  });

  it('create passes restaurantId, user.id and dto to service', async () => {
    const dto: CreateOrderDto = {
      tableId: 'table-1',
      items: [{ dishId: 'dish-1', quantity: 1 }],
    };
    (service.create as jest.Mock).mockResolvedValue(mockOrder);

    const result = await controller.create(mockUser, dto);

    expect(service.create).toHaveBeenCalledWith('rest-1', 'waiter-1', dto);
    expect(result).toEqual(mockOrder);
  });

  it('findByTable passes restaurantId and tableId to service', async () => {
    (service.findByTable as jest.Mock).mockResolvedValue([mockOrder]);

    const result = await controller.findByTable(mockUser, 'table-1');

    expect(service.findByTable).toHaveBeenCalledWith('rest-1', 'table-1');
    expect(result).toEqual([mockOrder]);
  });

  it('cancel passes restaurantId, id, user.id and user.role to service', async () => {
    (service.cancel as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.CANCELLED,
    });

    const result = await controller.cancel(mockUser, 'order-1');

    expect(service.cancel).toHaveBeenCalledWith(
      'rest-1',
      'order-1',
      'waiter-1',
      'waiter',
    );
    expect(result.status).toBe(OrderStatus.CANCELLED);
  });
});
