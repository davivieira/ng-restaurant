import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../entities/user.entity';
import type { RequestUser } from '../auth/current-user.decorator';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';
import { Dish } from '../entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

describe('DishesController', () => {
  let controller: DishesController;
  let service: jest.Mocked<DishesService>;

  const mockUser: RequestUser = {
    id: 'u1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
    restaurantId: 'rest-1',
    name: 'Admin',
  };

  const mockDish: Dish = {
    id: 'dish-1',
    restaurantId: 'rest-1',
    name: 'Soup',
    description: null,
    price: '5.00',
    categoryId: null,
    isActive: true,
    createdAt: new Date(),
  } as Dish;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishesController],
      providers: [
        {
          provide: DishesService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(DishesController);
    service = module.get(DishesService);
  });

  it('findAll passes user.restaurantId and optional categoryId to service', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([mockDish]);
    const result = await controller.findAll(mockUser);
    expect(service.findAll).toHaveBeenCalledWith('rest-1', undefined);
    expect(result).toEqual([mockDish]);
  });

  it('findAll with categoryId query passes it to service', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([mockDish]);
    await controller.findAll(mockUser, 'cat-1');
    expect(service.findAll).toHaveBeenCalledWith('rest-1', 'cat-1');
  });

  it('create passes user.restaurantId and dto to service', async () => {
    const dto: CreateDishDto = { name: 'Salad', price: 8 };
    (service.create as jest.Mock).mockResolvedValue({
      ...mockDish,
      name: dto.name,
    });
    const result = await controller.create(mockUser, dto);
    expect(service.create).toHaveBeenCalledWith('rest-1', dto);
    expect(result.name).toBe('Salad');
  });

  it('update passes user.restaurantId, id and dto to service', async () => {
    const dto: UpdateDishDto = { name: 'Updated' };
    (service.update as jest.Mock).mockResolvedValue({
      ...mockDish,
      name: dto.name,
    });
    const result = await controller.update(mockUser, 'dish-1', dto);
    expect(service.update).toHaveBeenCalledWith('rest-1', 'dish-1', dto);
    expect(result.name).toBe('Updated');
  });

  it('remove passes user.restaurantId and id to service', async () => {
    (service.remove as jest.Mock).mockResolvedValue(undefined);
    await controller.remove(mockUser, 'dish-1');
    expect(service.remove).toHaveBeenCalledWith('rest-1', 'dish-1');
  });
});
