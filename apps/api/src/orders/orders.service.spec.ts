import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { TableEntity } from '../entities/table.entity';
import { Dish } from '../entities/dish.entity';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepo: jest.Mocked<Repository<Order>>;
  let orderItemRepo: jest.Mocked<Repository<OrderItem>>;
  let tableRepo: jest.Mocked<Repository<TableEntity>>;
  let dishRepo: jest.Mocked<Repository<Dish>>;

  const restId = 'rest-1';
  const tableId = 'table-1';
  const waiterId = 'waiter-1';
  const mockTable = { id: tableId, restaurantId: restId } as TableEntity;
  const mockDish = { id: 'dish-1', restaurantId: restId } as Dish;
  const mockOrder: Order = {
    id: 'order-1',
    restaurantId: restId,
    tableId,
    waiterId,
    status: OrderStatus.PENDING,
    items: [],
    createdAt: new Date(),
  } as Order;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TableEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(OrdersService);
    orderRepo = module.get(getRepositoryToken(Order));
    orderItemRepo = module.get(getRepositoryToken(OrderItem));
    tableRepo = module.get(getRepositoryToken(TableEntity));
    dishRepo = module.get(getRepositoryToken(Dish));
  });

  describe('create', () => {
    const dto: CreateOrderDto = {
      tableId,
      items: [{ dishId: 'dish-1', quantity: 2, observations: 'no onions' }],
    };

    it('creates order and items when table and dishes exist', async () => {
      (tableRepo.findOne as jest.Mock).mockResolvedValue(mockTable);
      (dishRepo.find as jest.Mock).mockResolvedValue([mockDish]);
      (orderRepo.create as jest.Mock).mockReturnValue(mockOrder);
      (orderRepo.save as jest.Mock).mockResolvedValue(mockOrder);
      (orderItemRepo.create as jest.Mock).mockReturnValue({} as OrderItem);
      (orderItemRepo.save as jest.Mock).mockResolvedValue([]);
      (orderRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockOrder,
        items: [],
        table: mockTable,
        waiter: {},
      });

      const result = await service.create(restId, waiterId, dto);

      expect(tableRepo.findOne).toHaveBeenCalledWith({
        where: { id: tableId, restaurantId: restId },
      });
      expect(dishRepo.find).toHaveBeenCalled();
      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId: restId,
          tableId,
          waiterId,
          status: OrderStatus.PENDING,
        }),
      );
      expect(orderItemRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when table not found', async () => {
      (tableRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.create(restId, waiterId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(restId, waiterId, dto)).rejects.toThrow(
        'Table not found',
      );
    });

    it('throws BadRequestException when items empty', async () => {
      (tableRepo.findOne as jest.Mock).mockResolvedValue(mockTable);

      await expect(
        service.create(restId, waiterId, { tableId, items: [] }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(restId, waiterId, { tableId, items: [] }),
      ).rejects.toThrow('Order must have at least one item');
    });

    it('throws BadRequestException when dish not in restaurant', async () => {
      (tableRepo.findOne as jest.Mock).mockResolvedValue(mockTable);
      (dishRepo.find as jest.Mock).mockResolvedValue([]);

      await expect(service.create(restId, waiterId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(restId, waiterId, dto)).rejects.toThrow(
        /not found or not in your restaurant/,
      );
    });
  });

  describe('findByTable', () => {
    it('returns orders when table exists', async () => {
      (tableRepo.findOne as jest.Mock).mockResolvedValue(mockTable);
      (orderRepo.find as jest.Mock).mockResolvedValue([mockOrder]);

      const result = await service.findByTable(restId, tableId);

      expect(tableRepo.findOne).toHaveBeenCalledWith({
        where: { id: tableId, restaurantId: restId },
      });
      expect(orderRepo.find).toHaveBeenCalledWith({
        where: { tableId, restaurantId: restId },
        relations: ['items', 'items.dish', 'waiter'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockOrder]);
    });

    it('throws NotFoundException when table not found', async () => {
      (tableRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findByTable(restId, tableId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByTable(restId, tableId)).rejects.toThrow(
        'Table not found',
      );
    });
  });

  describe('cancel', () => {
    const orderWithRelations = {
      ...mockOrder,
      status: OrderStatus.PENDING,
      waiterId,
      items: [],
      table: mockTable,
      waiter: {},
    } as Order;

    it('cancels order when status is pending and user is waiter or admin', async () => {
      const orderPending = {
        ...orderWithRelations,
        status: OrderStatus.PENDING,
      };
      (orderRepo.findOne as jest.Mock).mockResolvedValue(orderPending);
      (orderRepo.save as jest.Mock).mockResolvedValue({
        ...orderPending,
        status: OrderStatus.CANCELLED,
      });

      const result = await service.cancel(
        restId,
        'order-1',
        waiterId,
        'waiter',
      );

      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'order-1', restaurantId: restId },
        relations: ['items', 'items.dish', 'table', 'waiter'],
      });
      expect(orderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.CANCELLED }),
      );
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('allows admin to cancel any order', async () => {
      const orderPending = {
        ...orderWithRelations,
        status: OrderStatus.PENDING,
      };
      (orderRepo.findOne as jest.Mock).mockResolvedValue(orderPending);
      (orderRepo.save as jest.Mock).mockResolvedValue({
        ...orderPending,
        status: OrderStatus.CANCELLED,
      });

      await service.cancel(restId, 'order-1', 'other-waiter', 'admin');

      expect(orderRepo.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when order not found', async () => {
      (orderRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.cancel(restId, 'order-1', waiterId, 'waiter'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.cancel(restId, 'order-1', waiterId, 'waiter'),
      ).rejects.toThrow('Order not found');
    });

    it('throws BadRequestException when order is in_progress', async () => {
      (orderRepo.findOne as jest.Mock).mockResolvedValue({
        ...orderWithRelations,
        status: OrderStatus.IN_PROGRESS,
      });

      await expect(
        service.cancel(restId, 'order-1', waiterId, 'waiter'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.cancel(restId, 'order-1', waiterId, 'waiter'),
      ).rejects.toThrow('Cannot cancel order in progress');
    });

    it('throws BadRequestException when order already cancelled', async () => {
      (orderRepo.findOne as jest.Mock).mockResolvedValue({
        ...orderWithRelations,
        status: OrderStatus.CANCELLED,
      });

      await expect(
        service.cancel(restId, 'order-1', waiterId, 'waiter'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.cancel(restId, 'order-1', waiterId, 'waiter'),
      ).rejects.toThrow('Order is already cancelled');
    });

    it('throws BadRequestException when waiter tries to cancel another waiter order', async () => {
      const otherWaiterOrder = {
        ...orderWithRelations,
        status: OrderStatus.PENDING,
        waiterId: 'other-waiter',
      };
      (orderRepo.findOne as jest.Mock).mockResolvedValue(otherWaiterOrder);

      await expect(
        service.cancel(restId, 'order-1', waiterId, 'waiter'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.cancel(restId, 'order-1', waiterId, 'waiter'),
      ).rejects.toThrow('You can only cancel your own orders');
    });
  });
});
