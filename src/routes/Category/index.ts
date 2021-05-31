import { UserType } from '../../entities/User';
import { checkLogin, checkRole } from '../auth';
import { RoutesType, Method, RoutesTypeWS } from '../types';
import { create, get, update, del } from './controller';

const crud: RoutesType[] = [
  {
    // Get all categories from restaurant (:id)
    method: Method.GET,
    route: "/categories/:id",
    controller: get,
  },
  {
    // Create a category
    method: Method.POST,
    route: "/category",
    controller: create,
    middlewares: [
      checkLogin(),
      checkRole([
        UserType.PRO,
        UserType.ADMIN
      ])
    ]
  },
  {
    // Update a category
    method: Method.PUT,
    route: "/category/:id",
    controller: update,
    middlewares: [
      checkLogin(),
      checkRole([
        UserType.PRO,
        UserType.ADMIN
      ])
    ]
  },
  {
    // Delete a category
    method: Method.DELETE,
    route: "/category/:id",
    controller: del,
    middlewares: [
      checkLogin(),
      checkRole([
        UserType.PRO,
        UserType.ADMIN
      ])
    ]
  }
];

const websockets: RoutesTypeWS[] = [];

export default {
  crud,
  websockets
};