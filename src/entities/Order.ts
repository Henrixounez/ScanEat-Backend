import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderDish } from "./OrderDish";
import { Restaurant } from "./Restaurant";
import { User } from "./User";

export enum OrderStatus {
  WAITING = "waiting",
  CONFIRMED = "confirmed",
  REFUSED = "refused",
  FINISHED = "finished",
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: OrderStatus.WAITING })
  status: OrderStatus;

  @Column({ default: false })
  paid: boolean;

  @Column({ default: 0 })
  table: number;

  @OneToMany(() => OrderDish, relation => relation.order)
  dishes: OrderDish[];

  @ManyToOne(() => User, relation => relation.orders)
  user: User;

  @ManyToOne(() => Restaurant, relation => relation.orders)
  restaurant: Restaurant;

  @Column({ default: 0, type: "float4" })
  price: number;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}