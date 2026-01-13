import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type WSCallback = (payload: any) => void;
const SocketContext = createContext<{
  connected: boolean;
  on: (evt: string, cb: WSCallback) => () => void;
  send?: (obj: any) => void;
} | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Record<string, Set<WSCallback>>>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3005");
    wsRef.current = ws;
    ws.addEventListener("open", () => setConnected(true));
    ws.addEventListener("close", () => setConnected(false));
    ws.addEventListener("message", (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const type = payload.type;
        const set = listenersRef.current[type];
        if (set) {
          for (const cb of set) cb(payload);
        }
      } catch (e) {
        console.warn("invalid ws message", e);
      }
    });
    return () => ws.close();
  }, []);

  const on = (eventType: string, cb: WSCallback) => {
    if (!listenersRef.current[eventType])
      listenersRef.current[eventType] = new Set();
    listenersRef.current[eventType].add(cb);
    return () => listenersRef.current[eventType].delete(cb);
  };

  const send = (obj: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(obj));
    }
  };

  return (
    <SocketContext.Provider value={{ connected, on, send }}>
      {children}
    </SocketContext.Provider>
  );
};
