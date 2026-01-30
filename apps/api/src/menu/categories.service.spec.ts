import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: jest.Mocked<Repository<Category>>;

  const restA = 'restaurant-a';
  const restB = 'restaurant-b';
  const categoryA: Category = {
    id: 'cat-1',
    restaurantId: restA,
    name: 'Starters',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
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

    service = module.get(CategoriesService);
    repo = module.get(getRepositoryToken(Category));
  });

  describe('tenant scoping', () => {
    it('findAll uses restaurantId in where', async () => {
      (repo.find as jest.Mock).mockResolvedValue([categoryA]);

      await service.findAll(restA);

      expect(repo.find).toHaveBeenCalledWith({
        where: { restaurantId: restA },
        order: { name: 'ASC' },
      });
    });

    it('create uses passed restaurantId, never body', async () => {
      const dto: CreateCategoryDto = { name: 'Desserts' };
      (repo.create as jest.Mock).mockReturnValue({
        ...categoryA,
        name: dto.name,
      });
      (repo.save as jest.Mock).mockResolvedValue({
        ...categoryA,
        name: dto.name,
      });

      await service.create(restA, dto);

      expect(repo.create).toHaveBeenCalledWith({
        restaurantId: restA,
        name: 'Desserts',
      });
      expect(repo.save).toHaveBeenCalled();
    });

    it('update requires id and restaurantId match', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(categoryA);
      (repo.save as jest.Mock).mockResolvedValue({
        ...categoryA,
        name: 'Updated',
      });
      const dto: UpdateCategoryDto = { name: 'Updated' };

      await service.update(restA, 'cat-1', dto);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-1', restaurantId: restA },
      });
    });

    it('update with empty dto does not change name', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(categoryA);
      (repo.save as jest.Mock).mockResolvedValue(categoryA);
      await service.update(restA, 'cat-1', {});
      expect(repo.save).toHaveBeenCalledWith(categoryA);
    });

    it('update throws when category belongs to another restaurant', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const dto: UpdateCategoryDto = { name: 'Updated' };

      await expect(service.update(restB, 'cat-1', dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(restB, 'cat-1', dto)).rejects.toThrow(
        'Category not found',
      );
    });

    it('remove uses restaurantId in delete', async () => {
      (repo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove(restA, 'cat-1');

      expect(repo.delete).toHaveBeenCalledWith({
        id: 'cat-1',
        restaurantId: restA,
      });
    });

    it('remove throws when no row affected (wrong restaurant)', async () => {
      (repo.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.remove(restB, 'cat-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(restB, 'cat-1')).rejects.toThrow(
        'Category not found',
      );
    });
  });
});
