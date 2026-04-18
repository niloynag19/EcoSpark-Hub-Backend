import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  role: string;
}

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { sub: userId, role } as TokenPayload,
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

export const generateRefreshToken = (userId: string, role: string): string => {
  return jwt.sign(
    { sub: userId, role } as TokenPayload,
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
  ) as TokenPayload;
};
