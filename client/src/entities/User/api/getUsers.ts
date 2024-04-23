import { httpClient } from "../../../shared/api/http/httpClient"
import { PotentialChat } from "../../Chat/types/chatTypes"

export const getUsers = (): Promise<PotentialChat[]> => {
  return httpClient.get('/user')
}