import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Dish } from "./Dish";
import { Restaurant } from "./Restaurant";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Restaurant, relation => relation.dishes)
  restaurant: Restaurant;

  @OneToMany(() => Dish, relation => relation.category)
  dishes: Dish[];  

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}