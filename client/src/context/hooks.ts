import { useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';

export function useWebSocket() {
  return useContext(WebSocketContext);
}
