import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Category } from "./Category";
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

  @Column({ default: "" })
  image: string;

  @Column()
  city: string;

  @Column({ type: "float4" })
  latt: number;

  @Column({ type: "float4" })
  long: number;

  @OneToOne(() => User, relation => relation.restaurant)
  owner: User;

  @OneToMany(() => Dish, relation => relation.restaurant)
  dishes: Dish[];

  @OneToMany(() => Category, relation => relation.restaurant)
  categories: Category[];

  @OneToMany(() => Order, relation => relation.restaurant)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}