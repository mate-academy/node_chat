import type { Message } from "./Message"

export type Room = {
    id: string,
    name: string,
    messages: Message[],
}