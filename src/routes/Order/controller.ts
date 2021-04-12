import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import * as jwt from "jsonwebtoken";
import { Restaurant } from "../../entities/Restaurant";
import { Order, OrderStatus } from "../../entities/Order";
import { Dish } from "../../entities/Dish";
import { User } from "../../entities/User";

interface TokenPayload {
  id: number;
  restaurantId: number;
}

interface OrderReturn {
  id: number;
  price: number;
  status: OrderStatus;
  restaurantName: string;
  createdAt: Date;
}
interface ProcessOrderReturn extends OrderReturn {
  // Token to access an Order in-process for not logged clients
  orderToken: string;
}

// GET
// Get Order with token
// Used during in-restaurant process when at table
export async function getByToken(req: Request, res: Response<ProcessOrderReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const orderRepository = getRepository(Order);
  const token = <string>req.headers['orderToken'];

  try {
    const { id, restaurantId } = <TokenPayload>jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    try {
      const restaurant = await restaurantRepository.findOneOrFail(restaurantId);
      const order = await orderRepository.findOneOrFail(id);
      res.status(StatusCodes.OK).json({
        id: order.id,
        orderToken: token,
        price: order.price,
        status: order.status,
        restaurantName: restaurant.name,
        createdAt: order.createdAt,
      });
    } catch (e) {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
  } catch (e) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
  }
}

// GET
// Get Order with id
// To retrieve an order after the restaurant
export async function getById(req: Request, res: Response<OrderReturn>): Promise<void> {
  const orderRepository = getRepository(Order);
  const { id } = req.params;

  try {
    const order = await orderRepository.findOneOrFail(id, {
      relations: ["user", "restaurant"]
    });
    if (order.user.id !== res.locals.user.id) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    res.status(StatusCodes.OK).json({
      id: order.id,
      price: order.price,
      status: order.status,
      restaurantName: order.restaurant.name,
      createdAt: order.createdAt,
    });
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// GET
// Get all User Orders
export async function getUserOrders(req: Request, res: Response<OrderReturn[]>): Promise<void> {
  const userRepository = getRepository(User);
  const id = res.locals.user.id;

  try {
    const user = await userRepository.findOneOrFail(id, {
      relations: ["orders", "orders.restaurant"]
    });

    res.status(StatusCodes.OK).json(
      user.orders.map<OrderReturn>((order) => ({
        id: order.id,
        price: order.price,
        status: order.status,
        restaurantName: order.restaurant.name,
        createdAt: order.createdAt,
      }))
    );
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// POST
// Create Order
export async function create(req: Request, res: Response<ProcessOrderReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const orderRepository = getRepository(Order);
  const dishRepository = getRepository(Dish);
  const { restaurantId, dishesId } = req.body;

  try {
    const user = res.locals.user;
    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id: restaurantId }
    });
    const dishes = await dishRepository.findByIds(dishesId);
    const price = dishes.reduce((acc, e) => acc + e.price, 0);
    const order = await orderRepository.save(
      orderRepository.create({
        dishes,
        user,
        restaurant,
        price,
      })
    );
    const payload: TokenPayload = { id: order.id, restaurantId: restaurant.id }
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "SECRET",
      { expiresIn: "1d" },
    );
    res.status(StatusCodes.OK).json({
      id: order.id,
      orderToken: token,
      price: order.price,
      status: order.status,
      restaurantName: restaurant.name,
      createdAt: order.createdAt,
  });
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// PATCH
// Pay order
// TODO: Not be accessible here, but who cares for a Poc :shrug:
export async function pay(req: Request, res: Response<ProcessOrderReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const orderRepository = getRepository(Order);
  const token = <string>req.headers['orderToken'];

  try {
    const { id, restaurantId } = <TokenPayload>jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    try {
      const restaurant = await restaurantRepository.findOneOrFail(restaurantId);
      const order = await orderRepository.findOneOrFail(id);
      order.status = OrderStatus.PAID;
      await orderRepository.save(order);
      res.status(StatusCodes.OK).json({
        id: order.id,
        orderToken: token,
        price: order.price,
        status: order.status,
        restaurantName: restaurant.name,
        createdAt: order.createdAt,
      });
    } catch (e) {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
  } catch (e) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
  }
}