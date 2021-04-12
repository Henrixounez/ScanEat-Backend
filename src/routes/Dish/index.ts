import { UserType } from '../../entities/User';
import { checkLogin, checkRole } from '../auth';
import { RoutesType, Method, RoutesTypeWS } from '../types';
import { create, get } from './controller';

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
      checkRole([UserType.PRO])
    ]
  },
];

const websockets: RoutesTypeWS[] = [];

export default {
  crud,
  websockets
};