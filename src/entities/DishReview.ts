import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Dish } from "./Dish";
import { User } from "./User";

@Entity()
export class DishReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  note: number;

  @Column()
  text: string;

  @ManyToOne(() => User, relation => relation.dishReviews)
  user: User;

  @ManyToOne(() => Dish, relation => relation.dishReviews)
  dish: Dish;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}