import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { Dish } from "../../entities/Dish";
import { DishReview } from "../../entities/DishReview";
import { User } from "../../entities/User";

export interface DishReviewReturn {
  id: number;
  note: number;
  text: string;
  username: string;
  createdAt: Date;
}

export const formatDishReviewReturn = (dishReview: DishReview): DishReviewReturn => ({
  id: dishReview.id,
  note: dishReview.note,
  text: dishReview.text,
  username: dishReview.user.getName(),
  createdAt: dishReview.createdAt
});

// GET
// Get all Review for Dish Id
export async function get(req: Request, res: Response<DishReviewReturn[]>): Promise<void> {
  const dishRepository = getRepository(Dish);
  const { id } = req.params;

  try {
    const dish = await dishRepository.findOneOrFail({
      where: { id },
      relations: ['dishReviews', 'dishReviews.user']
    });
    res.status(StatusCodes.OK).json(
      dish.dishReviews.map<DishReviewReturn>(formatDishReviewReturn)
    );
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// POST
// Create Dish Review
export async function create(req: Request, res: Response<DishReviewReturn>): Promise<void> {
  const dishRepository = getRepository(Dish);
  const dishReviewRepository = getRepository(DishReview);
  const { note, text, dishId } = req.body;

  try {
    const user: User = res.locals.user;
    const dish = await dishRepository.findOneOrFail({
      where: { id: dishId }
    });
    const dishReview = await dishReviewRepository.save(
      dishReviewRepository.create({
        dish,
        user,
        note,
        text,
      })
    );
    res.status(StatusCodes.OK).json(formatDishReviewReturn({...dishReview, user: user}));
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}