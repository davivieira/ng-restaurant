import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableEntity } from '../entities/table.entity';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([TableEntity])],
  controllers: [TablesController],
  providers: [TablesService, RolesGuard],
  exports: [TablesService],
})
export class TablesModule {}
