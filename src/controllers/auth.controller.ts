import { Request, Response } from 'express';

import { AuthData } from '../types/AuthData';
import { authService } from '../services/auth.service';
import { tokenService } from '../services/token.service';

import { NameSchema } from '../schemas/name.schema';
import { ResponseBody } from '../types/ResponseBody';
import { NormalizedUser } from '../types/NormalizedUser';
import { RefreshTokenSchema } from '../schemas/token.schema';

type AuthResponse = Response<
  ResponseBody<{ user: NormalizedUser; accessToken: string }>
>;

class AuthController {
  register = async (req: Request<{}, {}, NameSchema>, res: AuthResponse) => {
    const { name } = req.body;
    const authData = await authService.register(name);

    await this.sendAuthentication(res, authData);
  };

  refreshToken = async (
    req: Request & { cookies: RefreshTokenSchema },
    res: AuthResponse,
  ) => {
    const { refreshToken } = req.cookies;
    const authData = await tokenService.refresh(refreshToken);

    await this.sendAuthentication(res, authData);
  };

  private sendAuthentication = async (
    res: AuthResponse,
    { refreshToken, normalizedUser: user, ...otherData }: AuthData,
  ) => {
    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.status(201).json({
      message: 'OK',
      data: {
        user,
        ...otherData,
      },
    });
  };
}

export const authController = new AuthController();
