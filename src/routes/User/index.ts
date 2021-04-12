import { checkLogin } from '../auth';
import { RoutesType, Method, RoutesTypeWS } from '../types';
import { register, login, del } from './controller';

const crud: RoutesType[] = [
  {
    method: Method.POST,
    route: "/auth",
    controller: login,
  },
  {
    method: Method.POST,
    route: "/user",
    controller: register
  },
  {
    method: Method.DELETE,
    route: "/user",
    controller: del,
    middlewares: [
      checkLogin()
    ]
  }
];

const websockets: RoutesTypeWS[] = [];

export default {
  crud,
  websockets
};