import { User } from "../../../entities/User/types/userTypes";

export type RegistrationRequestType = {
  name: string;
  email: string;
  password: string;
}
export type RegistrationResponseType = {
  user: User;
  accessToken: string;
}
