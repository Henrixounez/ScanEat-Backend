import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Dish } from "./Dish";
import { Order } from "./Order";
import { User } from "./User";

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column()
  city: string;

  @OneToOne(() => User, relation => relation.restaurant)
  owner: User;

  @OneToMany(() => Dish, relation => relation.restaurant)
  dishes: Dish[];

  @OneToMany(() => Order, relation => relation.restaurant)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}