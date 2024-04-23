import { httpClient } from "../../../shared/api/http/httpClient"
import { RegistrationRequestType, RegistrationResponseType } from "../types/registrarionTypes";

export const registerUser = (
  formData: RegistrationRequestType
): Promise<RegistrationResponseType> => {
  return httpClient.post('/user/register', formData);
}