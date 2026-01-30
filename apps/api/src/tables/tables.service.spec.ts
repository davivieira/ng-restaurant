import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEntity, TableStatus } from '../entities/table.entity';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

describe('TablesService', () => {
  let service: TablesService;
  let repo: jest.Mocked<Repository<TableEntity>>;

  const restA = 'restaurant-a';
  const restB = 'restaurant-b';
  const tableA: TableEntity = {
    id: 'table-1',
    restaurantId: restA,
    name: 'Table 1',
    status: TableStatus.FREE,
    currentWaiterId: null,
    createdAt: new Date(),
  } as TableEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesService,
        {
          provide: getRepositoryToken(TableEntity),
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

    service = module.get(TablesService);
    repo = module.get(getRepositoryToken(TableEntity));
  });

  describe('findAll', () => {
    it('uses restaurantId in where and orders by name', async () => {
      (repo.find as jest.Mock).mockResolvedValue([tableA]);

      await service.findAll(restA);

      expect(repo.find).toHaveBeenCalledWith({
        where: { restaurantId: restA },
        order: { name: 'ASC' },
      });
    });
  });

  describe('create', () => {
    it('creates table with restaurantId and dto', async () => {
      const dto: CreateTableDto = { name: 'Table 2' };
      (repo.create as jest.Mock).mockReturnValue({ ...tableA, name: dto.name });
      (repo.save as jest.Mock).mockResolvedValue({ ...tableA, name: dto.name });

      await service.create(restA, dto);

      expect(repo.create).toHaveBeenCalledWith({
        restaurantId: restA,
        name: 'Table 2',
        status: undefined,
      });
      expect(repo.save).toHaveBeenCalled();
    });

    it('creates table with status when provided', async () => {
      const dto: CreateTableDto = {
        name: 'Table 2',
        status: TableStatus.OCCUPIED,
      };
      (repo.create as jest.Mock).mockReturnValue({ ...tableA, ...dto });
      (repo.save as jest.Mock).mockResolvedValue({ ...tableA, ...dto });

      await service.create(restA, dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: TableStatus.OCCUPIED }),
      );
    });
  });

  describe('update', () => {
    it('updates table when found', async () => {
      const dto: UpdateTableDto = { name: 'Updated Table' };
      (repo.findOne as jest.Mock).mockResolvedValue(tableA);
      (repo.save as jest.Mock).mockResolvedValue({ ...tableA, name: dto.name });

      await service.update(restA, 'table-1', dto);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'table-1', restaurantId: restA },
      });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Updated Table' }),
      );
    });

    it('throws NotFoundException when table not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const dto: UpdateTableDto = { name: 'Updated' };

      await expect(service.update(restB, 'table-1', dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(restB, 'table-1', dto)).rejects.toThrow(
        'Table not found',
      );
    });

    it('updates currentWaiterId when provided', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(tableA);
      (repo.save as jest.Mock).mockResolvedValue({
        ...tableA,
        currentWaiterId: 'waiter-1',
      });
      const dto: UpdateTableDto = { currentWaiterId: 'waiter-1' };

      await service.update(restA, 'table-1', dto);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ currentWaiterId: 'waiter-1' }),
      );
    });
  });

  describe('remove', () => {
    it('deletes table when found', async () => {
      (repo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove(restA, 'table-1');

      expect(repo.delete).toHaveBeenCalledWith({
        id: 'table-1',
        restaurantId: restA,
      });
    });

    it('throws NotFoundException when no row affected', async () => {
      (repo.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.remove(restB, 'table-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(restB, 'table-1')).rejects.toThrow(
        'Table not found',
      );
    });
  });
});
