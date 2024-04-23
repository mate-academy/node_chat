import { httpClient } from "../../../shared/api/http/httpClient";
import { LoginRequestType, LoginResponseType } from '../types/loginFormTypes.js'

export const loginUser = async (formData: LoginRequestType): Promise<LoginResponseType> => {
  return httpClient.post('/user/login', formData)
}