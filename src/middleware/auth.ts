import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import User, {InterfaceUser} from '../models/Auth';

declare global {
  namespace Express {
    interface Request {
      user?: InterfaceUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(req.headers.authorization);
  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    const error = new Error('Unauthorized');
    res.status(401).json({error: error.message});
  }
  //*When we use Bearer token, we need to split the token from the string
  //* bearerToken gets 'Bearer + token' so split it
  const [, token] = bearerToken.split(' ');
  //* want position [1] only
  // console.log(tokenSplit, 'tokenSplit without Bearer');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //* We need veryfy the id decoded and compare it with the user in the dB

    if (typeof decoded === 'object' && decoded.id) {
      const user = await User.findById(decoded.id).select('_id email name');
      // console.log(user, 'from auth');
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(500).json({error: 'Invalid token'});
      }
    }
  } catch (error) {
    res.status(500).json({error: 'Invalid token'});
  }
};
