import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { User, UserType } from '../../entities/User';

interface UserReturn {
  firstname: string;
  lastname: string;
  email: string;
  type: UserType;
}
interface LoginReturn extends UserReturn {
  token: string;
}

// POST
// Login user
export async function login(req: Request, res: Response<LoginReturn>): Promise<void> {
  const { email, password } = req.body;
  const userRepository = getRepository(User);

  try {
    const user = await userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .addSelect("user.password")
      .getOneOrFail();
    if (!user.checkPassword(password)) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }
    const token = user.getJWTToken();
    res.setHeader('authorization', token);
    res.status(StatusCodes.OK).json({
      token,
      firstname: user.firstname,
      lastname: user.lastname,
      email,
      type: user.type,
    });
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

// POST
// Register user
export async function register(req: Request, res: Response<LoginReturn>): Promise<void> {
  const { email, password, firstname, lastname, type } = req.body;
  const userRepository = getRepository(User);

  try {
    const user = await userRepository.save(
      userRepository.create({
        email,
        password,
        firstname,
        lastname,
        type
      })
    );
    const token = user.getJWTToken();
    res.setHeader('authorization', token);
    res.status(StatusCodes.CREATED).json({
      token,
      firstname,
      lastname,
      email,
      type,
    });
  } catch (e) {
    res.sendStatus(StatusCodes.CONFLICT);
  }
}

// DELETE
// Remove user asking
export async function del(req: Request, res: Response): Promise<void> {
  const id = res.locals.jwtPayload.userId;
  const userRepository = getRepository(User);

  try {
    const user = await userRepository.findOneOrFail(id);
    await userRepository.remove(user);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (e) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}