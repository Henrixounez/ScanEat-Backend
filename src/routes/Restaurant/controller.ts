import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { Restaurant } from "../../entities/Restaurant";

interface RestaurantReturn {
  id: number;
  name: string;
  description: string;
  image: string;
}

// GET
// Get all restaurants in a city
export async function getByCity(req: Request, res: Response<RestaurantReturn[]>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const city = req.params.city;

  try {
    const restaurants = await restaurantRepository.find({
      where: { city }
    });
    res.status(StatusCodes.OK).json(
      restaurants.map<RestaurantReturn>((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        image: restaurant.image
      }))
    );
  } catch (e) {
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

// GET
// Get a single restaurant
export async function getById(req: Request, res: Response<RestaurantReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const id = req.params.id;

  try {
    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id },
    });
    res.status(StatusCodes.OK).json({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      image: restaurant.image
    });
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// POST
// Create Restaurant
export async function create(req: Request, res: Response<RestaurantReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const { name, description, image } = req.body;

  try {
    const user = res.locals.user;
    const restaurant = await restaurantRepository.save(
      restaurantRepository.create({
        name,
        description,
        image,
        owner: user,
      })
    );
    res.status(StatusCodes.CREATED).json({
      id: restaurant.id,
      name,
      description,
      image,
    })
  } catch (e) {
    res.sendStatus(StatusCodes.CONFLICT);
  }
}