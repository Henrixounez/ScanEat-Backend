import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { Restaurant } from "../../entities/Restaurant";
import { User, UserType } from "../../entities/User";
import { Order } from "../../entities/Order";
import { formatCategoryReturn, CategoryReturn } from "../Category/controller";

interface RestaurantReturn {
  id: number;
  name: string;
  description: string;
  image: string;
  city: string;
  latt: number;
  long: number;
}
type ProRestaurantReturn = RestaurantReturn & { categories: Array<CategoryReturn>, orders?: Array<Order>};

const formatRestaurantReturn = (restaurant: Restaurant): RestaurantReturn => ({
  id: restaurant.id,
  name: restaurant.name,
  description: restaurant.description,
  image: restaurant.image,
  latt: restaurant.latt,
  city: restaurant.city,
  long: restaurant.long,
});
const formatProRestaurantReturn = (restaurant: Restaurant): ProRestaurantReturn => ({
  id: restaurant.id,
  name: restaurant.name,
  description: restaurant.description,
  image: restaurant.image,
  latt: restaurant.latt,
  city: restaurant.city,
  long: restaurant.long,
  orders: restaurant.orders || [],
  categories: restaurant.categories?.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).map(formatCategoryReturn) || [],
});

const relationsClientRestaurant = ['categories', 'categories.dishes'];
const relationsProRestaurant = [
  "dishes",
  "dishes.dishReviews",
  "dishes.dishReviews.user",
  "categories",
  "categories.dishes",
  "orders",
  "orders.dishes",
  "orders.dishes.dish"
];

// GET
// Get all restaurants in a city
export async function get(req: Request, res: Response<RestaurantReturn[]>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  // const city = req.params.city;
  // TODO: Sorting

  try {
    const restaurants = await restaurantRepository.find({relations: ['owner']});
    res.status(StatusCodes.OK).json(
      restaurants.map<RestaurantReturn>(formatRestaurantReturn)
    );
  } catch (e) {
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

// GET
// Get all restaurants in a city
export async function getMyRestaurant(req: Request, res: Response<ProRestaurantReturn | null>): Promise<Response> {
  const userRepository = getRepository(User);
  const restaurantRepository = getRepository(Restaurant);

  try {
    const gotRestaurant = await userRepository.findOneOrFail({
      where: { id: res.locals.user.id },
      relations: [ "restaurant" ]
    });

    if (!gotRestaurant.restaurant)
      return res.status(StatusCodes.OK).json(null);

    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id: gotRestaurant.restaurant.id },
      relations: relationsProRestaurant
    });

    return res.status(StatusCodes.OK).json(formatProRestaurantReturn(restaurant));
  } catch (e) {
    console.error(e);
    return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

// GET
// Get a single restaurant
export async function getById(req: Request, res: Response<RestaurantReturn | ProRestaurantReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const id = req.params.id;

  try {
    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id },
      relations: res.locals.user?.type === UserType.PRO ? relationsProRestaurant : relationsClientRestaurant
    });
    res.status(StatusCodes.OK).json(formatProRestaurantReturn(restaurant));
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}


// PUT
// Update Restaurant
export async function update(req: Request, res: Response<ProRestaurantReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const userRepository = getRepository(User);
  const { name, description, image, city, latt, long, ownerId } = req.body;
  const askerRole = res.locals.role;
  const id = req.params.id;

  try {
    const user = await userRepository.findOneOrFail(ownerId && askerRole === UserType.ADMIN ? ownerId : res.locals.user?.id);
    const restaurant = await restaurantRepository.findOneOrFail(id, { relations: [...relationsProRestaurant, 'owner'] });
    restaurant.name = name === undefined ? restaurant.name : name;
    restaurant.description = description === undefined ? restaurant.description : description;
    restaurant.image = image === undefined ? restaurant.image : image;
    restaurant.city = city === undefined ? restaurant.city : city;
    restaurant.latt = latt === undefined ? restaurant.latt : latt;
    restaurant.long = long === undefined ? restaurant.long : long;
    if (user.type !== UserType.ADMIN && restaurant.owner?.id !== user.id) {
      restaurant.owner = user;
    }
    await restaurantRepository.save(restaurant);
    res.status(StatusCodes.OK).json(formatProRestaurantReturn(restaurant));
  } catch (e) {
    console.error(e);
    res.sendStatus(StatusCodes.CONFLICT);
  }
}

// POST
// Create Restaurant
export async function create(req: Request, res: Response<ProRestaurantReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const userRepository = getRepository(User);
  const { name, description, image, latt, long, city } = req.body;

  try {
    const user = await userRepository.findOneOrFail(res.locals.user.id);
    const restaurant = await restaurantRepository.save(
      restaurantRepository.create({
        name,
        description,
        image,
        owner: user,
        city,
        latt,
        long,
      })
    );
    res.status(StatusCodes.CREATED).json(formatProRestaurantReturn(restaurant));
  } catch (e) {
    console.error(e);
    res.sendStatus(StatusCodes.CONFLICT);
  }
}