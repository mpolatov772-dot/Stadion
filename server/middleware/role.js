import { AppError } from '../utils/appError.js';

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication is required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have access to this resource', 403));
    }

    return next();
  };
