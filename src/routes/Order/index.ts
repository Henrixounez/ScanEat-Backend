import { UserType } from '../../entities/User';
import { checkLogin, checkRole } from '../auth';
import { RoutesType, Method, RoutesTypeWS } from '../types';
import { getByToken, getById, getUserOrders, create, pay } from './controller';

const crud: RoutesType[] = [
  {
    // Get Order by Token (Used during in-restaurant order process)
    method: Method.GET,
    route: "/order/token",
    controller: getByToken,
  },
  {
    // Get Order by Id (Used by User after restaurant)
    method: Method.GET,
    route: "/order/:id",
    controller: getById,
    middlewares: [
      checkLogin(),
      checkRole([UserType.CLIENT])
    ]
  },
  {
    // Get all User orders
    method: Method.GET,
    route: "/orders",
    controller: getUserOrders,
    middlewares: [
      checkLogin(),
      checkRole([UserType.CLIENT])
    ]
  },
  {
    // Create an Order (Can be done when not logged)
    method: Method.POST,
    route: "/order",
    controller: create,
    middlewares: [
      checkLogin(true),
    ]
  },
  {
    // Pay an Order (Can be done when not logged)
    method: Method.PATCH,
    route: "/order/pay",
    controller: pay,
  }
];

const websockets: RoutesTypeWS[] = [];

export default {
  crud,
  websockets
};