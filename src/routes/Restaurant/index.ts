import { UserType } from '../../entities/User';
import { checkLogin, checkRole } from '../auth';
import { RoutesType, Method, RoutesTypeWS } from '../types';
import { create, get, getMyRestaurant, getById, update } from './controller';

const crud: RoutesType[] = [
  {
    // Get all restaurants in a city (by name)
    method: Method.GET,
    route: "/restaurants/",
    controller: get,
    middlewares: [
      checkLogin(true),
    ]
  },
  {
    // Get user restaurant
    method: Method.GET,
    route: "/restaurant/",
    controller: getMyRestaurant,
    middlewares: [
      checkLogin(true),
      checkRole([UserType.PRO])
    ]
  },
  {
    // Get a single restaurant by Id
    method: Method.GET,
    route: "/restaurant/:id",
    controller: getById,
    middlewares: [
      checkLogin(true),
    ]
  },
  {
    method: Method.PUT,
    route: "/restaurant/:id",
    controller: update,
    middlewares: [
      checkLogin(),
      checkRole([UserType.PRO, UserType.ADMIN])
    ]
  },
  {
    // Create a restaurant
    method: Method.POST,
    route: "/restaurant",
    controller: create,
    middlewares: [
      checkLogin(),
      checkRole([UserType.PRO])
    ]
  }
];

const websockets: RoutesTypeWS[] = [];

export default {
  crud,
  websockets
};