import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { config } from '../config/env';
import { AuthenticationError } from './errors';

const accessSecret = new TextEncoder().encode(config.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(config.JWT_REFRESH_SECRET);

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export const generateAccessToken = async (payload: TokenPayload): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.JWT_ACCESS_EXPIRY)
    .sign(accessSecret);
};

export const generateRefreshToken = async (payload: TokenPayload): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.JWT_REFRESH_EXPIRY)
    .sign(refreshSecret);
};

export const verifyAccessToken = async (token: string): Promise<TokenPayload> => {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return payload as unknown as TokenPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired access token');
  }
};

export const verifyRefreshToken = async (token: string): Promise<TokenPayload> => {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return payload as unknown as TokenPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};
