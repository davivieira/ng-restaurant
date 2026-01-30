import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../entities/user.entity';
import type { RequestUser } from '../auth/current-user.decorator';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { TableEntity, TableStatus } from '../entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

describe('TablesController', () => {
  let controller: TablesController;
  let service: jest.Mocked<TablesService>;

  const mockUser: RequestUser = {
    id: 'u1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
    restaurantId: 'rest-1',
    name: 'Admin',
  };

  const mockTable: TableEntity = {
    id: 'table-1',
    restaurantId: 'rest-1',
    name: 'Table 1',
    status: TableStatus.FREE,
    currentWaiterId: null,
    createdAt: new Date(),
  } as TableEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablesController],
      providers: [
        {
          provide: TablesService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(TablesController);
    service = module.get(TablesService);
  });

  it('findAll passes user.restaurantId to service', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([mockTable]);
    const result = await controller.findAll(mockUser);
    expect(service.findAll).toHaveBeenCalledWith('rest-1');
    expect(result).toEqual([mockTable]);
  });

  it('create passes user.restaurantId and dto to service', async () => {
    const dto: CreateTableDto = { name: 'Table 2' };
    (service.create as jest.Mock).mockResolvedValue({
      ...mockTable,
      name: dto.name,
    });
    const result = await controller.create(mockUser, dto);
    expect(service.create).toHaveBeenCalledWith('rest-1', dto);
    expect(result.name).toBe('Table 2');
  });

  it('update passes user.restaurantId, id and dto to service', async () => {
    const dto: UpdateTableDto = { status: TableStatus.OCCUPIED };
    (service.update as jest.Mock).mockResolvedValue({
      ...mockTable,
      status: dto.status,
    });
    const result = await controller.update(mockUser, 'table-1', dto);
    expect(service.update).toHaveBeenCalledWith('rest-1', 'table-1', dto);
    expect(result.status).toBe(TableStatus.OCCUPIED);
  });

  it('remove passes user.restaurantId and id to service', async () => {
    (service.remove as jest.Mock).mockResolvedValue(undefined);
    await controller.remove(mockUser, 'table-1');
    expect(service.remove).toHaveBeenCalledWith('rest-1', 'table-1');
  });
});
