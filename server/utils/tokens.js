import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || 'super-secret-change-me',
    {
      expiresIn: '7d',
    },
  );

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET || 'super-secret-change-me');
