import { Message } from "./message"

export interface Room {
  id: string
  name: string
  color: string
  messages: Message[]
}
