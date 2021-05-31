import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import * as jwt from "jsonwebtoken";
import { Order } from "./Order";
import { DishReview } from "./DishReview";
import { Restaurant } from "./Restaurant";

export enum UserType {
  CLIENT = "client",
  PRO = "pro",
  ADMIN = "admin"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstname?: string;

  @Column()
  lastname?: string;

  @Column({ select: false })
  password: string;

  @Column({ default: UserType.CLIENT })
  type: UserType;

  @OneToMany(() => Order, relation => relation.user)
  orders: Order[];

  @OneToMany(() => DishReview, relation => relation.user)
  dishReviews: DishReview[];

  @OneToOne(() => Restaurant, relation => relation.owner)
  @JoinColumn()
  restaurant: Restaurant;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;


  @BeforeInsert()
  async insertListener(): Promise<void> {
    this.password = bcrypt.hashSync(this.password, 8);
  }



  checkPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }
  getJWTToken(): string {
    return jwt.sign(
      { userId: this.id, email: this.email },
      process.env.JWT_SECRET || "SECRET",
      { expiresIn: "7d" },
    )
  }
  getName(): string {
    return `${this.firstname} ${this.lastname?.[0] || ""}.`;
  }
}