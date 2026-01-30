import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TableStatus } from '../../entities/table.entity';

export class CreateTableDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}
