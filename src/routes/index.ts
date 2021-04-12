import Dish from './Dish';
import DishReview from './DishReview';
import Order from './Order';
import Restaurant from './Restaurant';
import { RoutesType, RoutesTypeWS } from './types';
import User from './User';

const modules = [
  Dish,
  DishReview,
  Order,
  Restaurant,
  User,
];

const crud: RoutesType[] = modules.flatMap((e) => e.crud);
const websockets: RoutesTypeWS[] = modules.flatMap((e) => e.websockets);

export default {
  crud,
  websockets,
};