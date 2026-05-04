import { AppError } from '../utils/appError.js';

export const notFoundHandler = (_req, _res, next) => {
  next(new AppError('Endpoint not found', 404));
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    details: error.details || null,
  });
};
