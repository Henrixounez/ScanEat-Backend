import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { Restaurant } from "../../entities/Restaurant";
import { Category } from "../../entities/Category";
import { DishReturn, formatDishReturn } from "../Dish/controller";
import { User, UserType } from "../../entities/User";
import { Dish } from "../../entities/Dish";

export interface CategoryReturn {
  id: number;
  name: string;
  dishes?: Array<DishReturn>;
}

export const formatCategoryReturn = (category: Category): CategoryReturn => ({
  id: category.id,
  name: category.name,
  dishes: category.dishes?.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).map(formatDishReturn) || [],
});

// GET
// Get categories for a Restaurant
export async function get(req: Request, res: Response<CategoryReturn[]>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const { id } = req.params;

  try {
    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id: id },
      relations: ['categories']
    });
    res.status(StatusCodes.OK).json(
      restaurant.categories.map(formatCategoryReturn)
    );
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// POST
// Create Category
export async function create(req: Request, res: Response<CategoryReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const categoryRepository = getRepository(Category);
  const { name, restaurantId } = req.body;

  try {
    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id: restaurantId }
    });
    const category = await categoryRepository.save(
      categoryRepository.create({
        name,
      })
    );
    category.restaurant = restaurant;
    await categoryRepository.save(category);
    res.status(StatusCodes.OK).json(formatCategoryReturn(category));
  } catch (e) {
    console.log(e);
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// PUT
// Update a Category
export async function update(req: Request, res: Response<CategoryReturn>): Promise<void> {
  const categoryRepository = getRepository(Category);
  const { id } = req.params;
  const { name } = req.body;

  try {
    const category = await categoryRepository.findOneOrFail(id, {
      relations: ['restaurant', 'restaurant.owner']
    });

    const user: User = res.locals.user;

    if (user.type === UserType.ADMIN || user.id === category.restaurant.owner.id) {
      category.name = name === undefined ? category.name : name;
      await categoryRepository.save(category);
      res.status(StatusCodes.OK).json(formatCategoryReturn(category));
    } else {
      res.sendStatus(StatusCodes.FORBIDDEN);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// DELETE
// Delete a Category
export async function del(req: Request, res: Response<CategoryReturn>): Promise<void> {
  const categoryRepository = getRepository(Category);
  const dishRepository = getRepository(Dish);
  const { id } = req.params;

  try {
    const category = await categoryRepository.findOneOrFail(id, {
      relations: ['restaurant', 'restaurant.owner', 'dishes']
    });

    const user: User = res.locals.user;

    if (user.type === UserType.ADMIN || user.id === category.restaurant.owner.id) {
      await Promise.all(category.dishes.map(async (dish) => {
        await dishRepository.delete(dish.id);
      }));
      await categoryRepository.delete(category.id);
      res.sendStatus(StatusCodes.OK);
    } else {
      res.sendStatus(StatusCodes.FORBIDDEN);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}