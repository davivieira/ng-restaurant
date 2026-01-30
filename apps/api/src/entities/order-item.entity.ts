import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Dish } from './dish.entity';

@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'dish_id' })
  dishId: string;

  @ManyToOne(() => Dish, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  observations: string | null;
}
