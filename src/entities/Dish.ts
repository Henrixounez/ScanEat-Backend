import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DishReview } from "./DishReview";
import { Order } from "./Order";
import { Restaurant } from "./Restaurant";

@Entity()
export class Dish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column()
  price: number;

  @ManyToOne(() => Restaurant, relation => relation.dishes)
  restaurant: Restaurant;

  @ManyToMany(() => Order, relation => relation.dishes)
  orders: Order[];  

  @OneToMany(() => DishReview, relation => relation.dish)
  dishReviews: DishReview[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}