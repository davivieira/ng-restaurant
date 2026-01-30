import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEntity } from '../entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(TableEntity)
    private readonly tableRepo: Repository<TableEntity>,
  ) {}

  async findAll(restaurantId: string): Promise<TableEntity[]> {
    return this.tableRepo.find({
      where: { restaurantId },
      order: { name: 'ASC' },
    });
  }

  async create(
    restaurantId: string,
    dto: CreateTableDto,
  ): Promise<TableEntity> {
    const table = this.tableRepo.create({
      restaurantId,
      name: dto.name.trim(),
      status: dto.status ?? undefined,
    });
    return this.tableRepo.save(table);
  }

  async update(
    restaurantId: string,
    id: string,
    dto: UpdateTableDto,
  ): Promise<TableEntity> {
    const table = await this.tableRepo.findOne({
      where: { id, restaurantId },
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    if (dto.name !== undefined) table.name = dto.name.trim();
    if (dto.status !== undefined) table.status = dto.status;
    if (dto.currentWaiterId !== undefined)
      table.currentWaiterId = dto.currentWaiterId ?? null;
    return this.tableRepo.save(table);
  }

  async remove(restaurantId: string, id: string): Promise<void> {
    const result = await this.tableRepo.delete({ id, restaurantId });
    if (result.affected === 0) {
      throw new NotFoundException('Table not found');
    }
  }
}
