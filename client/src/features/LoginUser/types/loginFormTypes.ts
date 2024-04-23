import { User } from "../../../entities/User/types/userTypes";

export type LoginRequestType = {
  email: string,
  password: string,
};

export type LoginResponseType = {
  user: User,
  accessToken: string,
};
