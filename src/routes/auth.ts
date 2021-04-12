import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { getRepository } from "typeorm";
import * as jwt from "jsonwebtoken";
import { User, UserType } from "../entities/User";

interface JwtPayload {
  userId: number,
  email: string,
}

export function checkRole(roles: UserType[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const id = res.locals.jwtPayload.userId;
    const userRepository = getRepository(User);

    try {
      const user = await userRepository.findOneOrFail(id);

      if (roles.indexOf(user.type) > -1) {
        res.locals.role = user.type;
        next();
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).send(`User is not of role ${roles}`);
      }
    } catch (e) {
      return res.status(StatusCodes.UNAUTHORIZED).send(`User ${id} not found`);
    }
  }
}

export function checkLogin(passthrough?: boolean) {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const token = <string>req.headers['authorization'];

    try {
      const jwtPayload = <JwtPayload>jwt.verify(token, process.env.JWT_SECRET || "SECRET");
      res.locals.jwtPayload = jwtPayload;

      const { userId } = jwtPayload;
      const user = await getRepository(User).findOneOrFail(userId);
      res.locals.user = user;
      const newToken = user.getJWTToken();
      res.setHeader('authorization', newToken);
      return next();
    } catch (e) {
      if (passthrough) {
        res.locals.user = undefined;
        return next();
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).send(`JWT is not correct or user was not found`);
      }
    }
  }
}