import { createContext } from "react";
import type { WebSocketClient } from "../types/socket";

export const WebSocketContext = createContext<WebSocketClient | null>(null);
