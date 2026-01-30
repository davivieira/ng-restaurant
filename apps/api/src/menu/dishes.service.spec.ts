import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../entities/dish.entity';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

describe('DishesService', () => {
  let service: DishesService;
  let repo: jest.Mocked<Repository<Dish>>;

  const restA = 'restaurant-a';
  const restB = 'restaurant-b';
  const dishA: Dish = {
    id: 'dish-1',
    restaurantId: restA,
    name: 'Soup',
    description: null,
    price: '5.00',
    categoryId: null,
    isActive: true,
    createdAt: new Date(),
  } as Dish;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishesService,
        {
          provide: getRepositoryToken(Dish),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(DishesService);
    repo = module.get(getRepositoryToken(Dish));
  });

  describe('tenant scoping', () => {
    it('findAll uses restaurantId in where', async () => {
      (repo.find as jest.Mock).mockResolvedValue([dishA]);

      await service.findAll(restA);

      expect(repo.find).toHaveBeenCalledWith({
        where: { restaurantId: restA },
        relations: ['category'],
        order: { name: 'ASC' },
      });
    });

    it('findAll with categoryId adds categoryId to where', async () => {
      (repo.find as jest.Mock).mockResolvedValue([dishA]);

      await service.findAll(restA, 'cat-1');

      expect(repo.find).toHaveBeenCalledWith({
        where: { restaurantId: restA, categoryId: 'cat-1' },
        relations: ['category'],
        order: { name: 'ASC' },
      });
    });

    it('create uses passed restaurantId', async () => {
      const dto: CreateDishDto = {
        name: 'Salad',
        price: 8,
        description: '',
        categoryId: null,
        isActive: true,
      };
      (repo.create as jest.Mock).mockReturnValue({ ...dishA, name: dto.name });
      (repo.save as jest.Mock).mockResolvedValue({ ...dishA, name: dto.name });

      await service.create(restA, dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId: restA,
          name: 'Salad',
          price: '8',
        }),
      );
      expect(repo.save).toHaveBeenCalled();
    });

    it('update requires id and restaurantId match', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(dishA);
      (repo.save as jest.Mock).mockResolvedValue({ ...dishA, name: 'Updated' });
      const dto: UpdateDishDto = { name: 'Updated' };

      await service.update(restA, 'dish-1', dto);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'dish-1', restaurantId: restA },
        relations: ['category'],
      });
    });

    it('update throws when dish belongs to another restaurant', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const dto: UpdateDishDto = { name: 'Updated' };

      await expect(service.update(restB, 'dish-1', dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(restB, 'dish-1', dto)).rejects.toThrow(
        'Dish not found',
      );
    });

    it('remove uses restaurantId in delete', async () => {
      (repo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove(restA, 'dish-1');

      expect(repo.delete).toHaveBeenCalledWith({
        id: 'dish-1',
        restaurantId: restA,
      });
    });

    it('remove throws when no row affected (wrong restaurant)', async () => {
      (repo.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.remove(restB, 'dish-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(restB, 'dish-1')).rejects.toThrow(
        'Dish not found',
      );
    });

    it('findAll with empty categoryId does not add categoryId to where', async () => {
      (repo.find as jest.Mock).mockResolvedValue([]);
      await service.findAll(restA, '   ');
      expect(repo.find).toHaveBeenCalledWith({
        where: { restaurantId: restA },
        relations: ['category'],
        order: { name: 'ASC' },
      });
    });

    it('create with description and isActive false', async () => {
      const dto: CreateDishDto = {
        name: 'Salad',
        price: 8,
        description: '  Fresh  ',
        categoryId: null,
        isActive: false,
      };
      (repo.create as jest.Mock).mockReturnValue({ ...dishA, ...dto });
      (repo.save as jest.Mock).mockResolvedValue({ ...dishA, ...dto });
      await service.create(restA, dto);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId: restA,
          name: 'Salad',
          description: 'Fresh',
          isActive: false,
        }),
      );
    });

    it('update applies all dto fields when provided', async () => {
      const existing = { ...dishA };
      (repo.findOne as jest.Mock).mockResolvedValue(existing);
      (repo.save as jest.Mock).mockResolvedValue(existing);
      const dto: UpdateDishDto = {
        name: 'New name',
        description: 'New desc',
        price: 10,
        categoryId: 'cat-1',
        isActive: false,
      };
      await service.update(restA, 'dish-1', dto);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New name',
          description: 'New desc',
          price: '10',
          categoryId: 'cat-1',
          isActive: false,
        }),
      );
    });
  });
});
