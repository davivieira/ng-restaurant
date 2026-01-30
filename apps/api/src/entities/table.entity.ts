import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { User } from './user.entity';
export enum TableStatus {
  FREE = 'free',
  OCCUPIED = 'occupied',
}

@Entity('restaurant_table')
export class TableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.tables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: TableStatus, default: TableStatus.FREE })
  status: TableStatus;

  @Column({ name: 'current_waiter_id', nullable: true })
  currentWaiterId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'current_waiter_id' })
  currentWaiter: User | null;

  @OneToMany('order', 'table')
  orders: unknown[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
