import { UserType } from '../../entities/User';
import { checkLogin, checkRole } from '../auth';
import { RoutesType, Method, RoutesTypeWS } from '../types';
import { create, get } from './controller';

const crud: RoutesType[] = [
  {
    // Get all Reviews from a Dish (:id)
    method: Method.GET,
    route: "/dishreviews/:id",
    controller: get,
  },
  {
    // Create a Review for a Dish
    method: Method.POST,
    route: "/dishreview",
    controller: create,
    middlewares: [
      checkLogin(),
      checkRole([UserType.CLIENT])
    ]
  },
];

const websockets: RoutesTypeWS[] = [];

export default {
  crud,
  websockets
};