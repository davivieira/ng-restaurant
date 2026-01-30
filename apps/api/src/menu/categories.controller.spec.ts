import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../entities/user.entity';
import type { RequestUser } from '../auth/current-user.decorator';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: jest.Mocked<CategoriesService>;

  const mockUser: RequestUser = {
    id: 'u1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
    restaurantId: 'rest-1',
    name: 'Admin',
  };

  const mockCategory: Category = {
    id: 'cat-1',
    restaurantId: 'rest-1',
    name: 'Starters',
    createdAt: new Date(),
  } as Category;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CategoriesController);
    service = module.get(CategoriesService);
  });

  it('findAll passes user.restaurantId to service', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([mockCategory]);
    const result = await controller.findAll(mockUser);
    expect(service.findAll).toHaveBeenCalledWith('rest-1');
    expect(result).toEqual([mockCategory]);
  });

  it('create passes user.restaurantId and dto to service', async () => {
    const dto: CreateCategoryDto = { name: 'Desserts' };
    (service.create as jest.Mock).mockResolvedValue({
      ...mockCategory,
      name: dto.name,
    });
    const result = await controller.create(mockUser, dto);
    expect(service.create).toHaveBeenCalledWith('rest-1', dto);
    expect(result.name).toBe('Desserts');
  });

  it('update passes user.restaurantId, id and dto to service', async () => {
    const dto: UpdateCategoryDto = { name: 'Updated' };
    (service.update as jest.Mock).mockResolvedValue({
      ...mockCategory,
      name: dto.name,
    });
    const result = await controller.update(mockUser, 'cat-1', dto);
    expect(service.update).toHaveBeenCalledWith('rest-1', 'cat-1', dto);
    expect(result.name).toBe('Updated');
  });

  it('remove passes user.restaurantId and id to service', async () => {
    (service.remove as jest.Mock).mockResolvedValue(undefined);
    await controller.remove(mockUser, 'cat-1');
    expect(service.remove).toHaveBeenCalledWith('rest-1', 'cat-1');
  });
});
