import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Category } from "./Category";
import { DishReview } from "./DishReview";
import { OrderDish } from "./OrderDish";
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

  @Column({ type: "float4" })
  price: number;

  @ManyToOne(() => Restaurant, relation => relation.dishes)
  restaurant: Restaurant;

  @ManyToOne(() => Category, relation => relation.dishes)
  category: Category;

  @OneToMany(() => OrderDish, relation => relation.dish)
  orders: OrderDish[];  

  @OneToMany(() => DishReview, relation => relation.dish)
  dishReviews: DishReview[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}