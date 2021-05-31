import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { Restaurant } from "../../entities/Restaurant";
import { Dish } from "../../entities/Dish";
import { Category } from "../../entities/Category";
import { formatDishReviewReturn, DishReviewReturn } from "../DishReview/controller";

export interface DishReturn {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: {
    id?: number;
  }
  dishReviews?: Array<DishReviewReturn>;
}

export const formatDishReturn = (dish: Dish): DishReturn => ({
  id: dish.id,
  name: dish.name,
  description: dish.description,
  image: dish.image,
  price: dish.price,
  category: {
    id: dish.category?.id || undefined,
  },
  dishReviews: dish.dishReviews?.map(formatDishReviewReturn),
});

// GET
// Get dishes for a Restaurant
export async function get(req: Request, res: Response<DishReturn[]>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const { id } = req.params;

  try {
    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id: id },
      relations: ['dishes', 'dishes.category']
    });
    res.status(StatusCodes.OK).json(
      restaurant.dishes.map(formatDishReturn)
    );
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// POST
// Create Dish
export async function create(req: Request, res: Response<DishReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const categoryRepository = getRepository(Category);
  const dishRepository = getRepository(Dish);
  const { name, description, image, price, restaurantId, categoryId } = req.body;

  try {
    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id: restaurantId }
    });
    const category = await categoryRepository.findOneOrFail({
      where: { id: categoryId }
    });

    const dish = await dishRepository.save(
      dishRepository.create({
        name,
        description,
        image,
        price,
      })
    );
    dish.restaurant = restaurant;
    dish.category = category;
    await dishRepository.save(dish);
    res.status(StatusCodes.OK).json(formatDishReturn(dish));
  } catch (e) {
    console.log(e);
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// PUT
// Update a Dish
export async function update(req: Request, res: Response<DishReturn>): Promise<void> {
  const dishRepository = getRepository(Dish);
  const { id } = req.params;
  const { name, description, image, price } = req.body;

  try {
    const dish = await dishRepository.findOneOrFail(id);

    dish.name = name === undefined ? dish.name : name;
    dish.description = description === undefined ? dish.description : description;
    dish.image = image === undefined ? dish.image : image;
    dish.price = price === undefined ? dish.price : price;
    await dishRepository.save(dish);
    res.status(StatusCodes.OK).json(formatDishReturn(dish));
  } catch (e) {
    console.log(e);
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// DELETE
// Delete a Dish
export async function del(req: Request, res: Response<DishReturn>): Promise<void> {
  const dishRepository = getRepository(Dish);
  const { id } = req.params;

  try {
    const dish = await dishRepository.findOneOrFail(id);

    await dishRepository.delete(dish.id);
    res.sendStatus(StatusCodes.OK);
  } catch (e) {
    console.log(e);
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}