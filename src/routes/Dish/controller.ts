import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { Restaurant } from "../../entities/Restaurant";
import { Dish } from "../../entities/Dish";

interface DishReturn {
  id: number;
  description: string;
  image: string;
  price: number;
}

// GET
// Get dishes for a Restaurant
export async function get(req: Request, res: Response<DishReturn[]>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const { id } = req.params;

  try {
    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id: id },
      relations: ['dishes']
    });
    res.status(StatusCodes.OK).json(
      restaurant.dishes.map((dish) => ({
        id: dish.id,
        description: dish.description,
        image: dish.image,
        price: dish.price,
      }))
    );
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// POST
// Create Dish
export async function create(req: Request, res: Response<DishReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const dishRepository = getRepository(Dish);
  const { name, description, image, price, restaurantId } = req.body;

  try {
    await restaurantRepository.findOneOrFail({
      where: { id: restaurantId }
    });
    const dish = await dishRepository.save(
      dishRepository.create({
        name,
        description,
        image,
        price,
      })
    );
    res.status(StatusCodes.OK).json({
      id: dish.id,
      description,
      image,
      price,
    });
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}