import { UserType } from '../../entities/User';
import { checkLogin, checkRole } from '../auth';
import { RoutesType, Method, RoutesTypeWS } from '../types';
import { create, del, get, update } from './controller';

const crud: RoutesType[] = [
  {
    // Get all dishes from restaurant (:id)
    method: Method.GET,
    route: "/dishes/:id",
    controller: get,
  },
  {
    // Create a dish
    method: Method.POST,
    route: "/dish",
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
    // Update a dish
    method: Method.PUT,
    route: "/dish/:id",
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
    // Delete a dish
    method: Method.DELETE,
    route: "/dish/:id",
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