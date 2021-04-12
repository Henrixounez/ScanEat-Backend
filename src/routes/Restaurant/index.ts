import { UserType } from '../../entities/User';
import { checkLogin, checkRole } from '../auth';
import { RoutesType, Method, RoutesTypeWS } from '../types';
import { create, getByCity, getById } from './controller';

const crud: RoutesType[] = [
  {
    // Get all restaurants in a city (by name)
    method: Method.GET,
    route: "/restaurants/:city",
    controller: getByCity,
    middlewares: [
      checkLogin(),
      checkRole([UserType.CLIENT])
    ]
  },
  {
    // Get a single restaurant by Id
    method: Method.GET,
    route: "/restaurant/:id",
    controller: getById,
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