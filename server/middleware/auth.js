import { findUserById } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { verifyToken } from '../utils/tokens.js';

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
      throw new AppError('Authentication token is required', 401);
    }

    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      throw new AppError('The session is no longer valid', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.name === 'JsonWebTokenError' ? new AppError('Invalid token', 401) : error);
  }
};
