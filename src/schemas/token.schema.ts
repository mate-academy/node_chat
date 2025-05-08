import { z } from 'zod';

const refresh = z.object({
  refreshToken: z
    .string({
      required_error: 'RefreshToken is required',
      invalid_type_error: 'RefreshToken must be a string',
    })
    .jwt({ message: 'Invalid refresh token' }),
});

const authorization = z.object({
  authorization: z
    .string({
      required_error: 'AccessToken is required',
      invalid_type_error: 'AccessToken must be a string',
    })
    .regex(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/, 'Invalid access token'),
});

const access = z.object({
  accessToken: z
    .string({
      required_error: 'AccessToken is required',
      invalid_type_error: 'AccessToken must be a string',
    })
    .jwt({ message: 'Invalid access token' }),
});

export const tokenSchema = {
  access,
  refresh,
  authorization,
};

export type AccessTokenSchema = z.infer<typeof access>;
export type RefreshTokenSchema = z.infer<typeof refresh>;
export type AuthorizationTokenSchema = z.infer<typeof authorization>;
