import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Dish } from './dish.entity';
import { TableEntity } from './table.entity';
import { Order } from './order.entity';

@Entity('restaurant')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => User, (user) => user.restaurant)
  users: User[];

  @OneToMany(() => Category, (category) => category.restaurant)
  categories: Category[];

  @OneToMany(() => Dish, (dish) => dish.restaurant)
  dishes: Dish[];

  @OneToMany(() => TableEntity, (table) => table.restaurant)
  tables: TableEntity[];

  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];
}
