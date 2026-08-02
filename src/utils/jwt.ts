import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

const JWT_EXPIRES_IN = '15m'; // 15 minutes

type JwtPayload = { userId: string; tokenVersion: number; sessionId: string };

export const jwtService = {
  sign(payload: JwtPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verify(token: string) {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  },
};
