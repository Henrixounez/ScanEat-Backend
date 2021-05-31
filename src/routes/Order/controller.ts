import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import * as jwt from "jsonwebtoken";
import { Restaurant } from "../../entities/Restaurant";
import { Order, OrderStatus } from "../../entities/Order";
import { Dish } from "../../entities/Dish";
import { User } from "../../entities/User";
import { OrderDish } from "../../entities/OrderDish";

interface TokenPayload {
  id: number;
  restaurantId: number;
}

interface OrderReturn {
  id: number;
  price: number;
  table: number;
  paid: boolean;
  status: OrderStatus;
  restaurantName: string;
  createdAt: Date;
}

interface ProcessOrderReturn extends OrderReturn {
  // Token to access an Order in-process for not logged clients
  orderToken: string;
}

export const formatOrderReturn = (order: Order, restaurant?: Restaurant): OrderReturn => ({
  id: order.id,
  price: order.price,
  paid: order.paid,
  table: order.table,
  status: order.status,
  restaurantName: order?.restaurant?.name || restaurant?.name || "",
  createdAt: order.createdAt,
});

// GET
// Get Order with token
// Used during in-restaurant process when at table
export async function getByToken(req: Request, res: Response<ProcessOrderReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const orderRepository = getRepository(Order);
  const token = <string>req.headers['ordertoken'];

  try {
    const { id, restaurantId } = <TokenPayload>jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    try {
      const restaurant = await restaurantRepository.findOneOrFail(restaurantId);
      const order = await orderRepository.findOneOrFail(id);
      res.status(StatusCodes.OK).json({
        ...formatOrderReturn(order, restaurant),
        orderToken: token,
      });
    } catch (e) {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
  } catch (e) {
    console.log(e);
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

    res.status(StatusCodes.OK).json(formatOrderReturn(order));
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
      user.orders.map<OrderReturn>((o) => formatOrderReturn(o))
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
  const orderDishRepository = getRepository(OrderDish);
  const dishRepository = getRepository(Dish);
  const { restaurantId, dishesId, table } = req.body;

  try {
    const user = res.locals.user;
    const restaurant = await restaurantRepository.findOneOrFail({
      where: { id: restaurantId }
    });
    const dishes: Array<Dish> = await Promise.all(dishesId.map(async (d: number) => dishRepository.findOne(d)));
    const price = dishes.reduce((acc, e) => acc + e.price, 0);
    const order = await orderRepository.save(
      orderRepository.create({
        user,
        restaurant,
        price,
        table,
      })
    );
    await Promise.all(
      dishes.map(async (d: Dish) => (
        await orderDishRepository.save(
          orderDishRepository.create({
            dish: d,
            order: order,
          })
        )
      ))
    );

    const payload: TokenPayload = { id: order.id, restaurantId: restaurant.id }
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "SECRET",
      { expiresIn: "1d" },
    );
    res.status(StatusCodes.OK).json({
      ...formatOrderReturn(order, restaurant),
      orderToken: token,
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// PATCH
// Pay order
// TODO: Not be accessible here, but who cares for a Poc :shrug:
export async function pay(req: Request, res: Response<ProcessOrderReturn>): Promise<void> {
  const restaurantRepository = getRepository(Restaurant);
  const orderRepository = getRepository(Order);
  const token = <string>req.headers['ordertoken'];

  try {
    const { id, restaurantId } = <TokenPayload>jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    try {
      const restaurant = await restaurantRepository.findOneOrFail(restaurantId);
      const order = await orderRepository.findOneOrFail(id);
      order.paid = true;
      await orderRepository.save(order);
      res.status(StatusCodes.OK).json({
        ...formatOrderReturn(order, restaurant),
        orderToken: token,
      });
    } catch (e) {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(StatusCodes.UNAUTHORIZED);
  }
}

// PATCH
// For the restaurants to update the asked Order
export async function update(req: Request, res: Response<OrderReturn>): Promise<void> {
  const orderRepository = getRepository(Order);
  const id = req.params.id;
  const { status, paid } = req.body;

  try {
    const order = await orderRepository.findOneOrFail(id, { relations: ["restaurant"] });
    order.status = status !== undefined ? status : order.status;
    order.paid = paid !== undefined ? paid : order.paid;
    await orderRepository.save(order);
    res.status(StatusCodes.OK).json(formatOrderReturn(order));
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}