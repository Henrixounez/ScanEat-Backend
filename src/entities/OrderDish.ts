import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Dish } from "./Dish";
import { Order } from "./Order";

@Entity()
export class OrderDish {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Dish, relation => relation.orders)
  dish: Dish;

  @ManyToOne(() => Order, relation => relation.dishes)
  order: Order;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}