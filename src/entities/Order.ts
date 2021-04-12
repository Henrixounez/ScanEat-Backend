import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Dish } from "./Dish";
import { Restaurant } from "./Restaurant";
import { User } from "./User";

export enum OrderStatus {
  WAITING = "waiting",
  CONFIRMED = "confirmed",
  REFUSED = "refused",
  PAID = "paid",
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: OrderStatus.WAITING })
  status: OrderStatus;

  @ManyToMany(() => Dish, relation => relation.orders)
  @JoinTable()
  dishes: Dish[];

  @ManyToOne(() => User, relation => relation.orders)
  user: User;

  @ManyToOne(() => Restaurant, relation => relation.orders)
  restaurant: Restaurant;

  @Column({ default: 0 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}