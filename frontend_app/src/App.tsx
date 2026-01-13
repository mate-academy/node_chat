import React from "react";

import "./index.css"; // import fallback styles (or Tailwind)
import { AuthModal } from "./components/AuthModal";
import { RoomControls } from "./components/RoomControls";
import { RoomList } from "./components/RoomList";
import { ChatArea } from "./components/ChatArea";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RoomsProvider } from "./context/RoomsContext";
import { SocketProvider } from "./context/SocketProvider";
import { MessagesProvider } from "./context/MessagesContext";

export const App: React.FC = () => {
  return (
    <SocketProvider>
      <AuthProvider>
        <RoomsProvider>
          <MessagesProvider>
            <RootApp />
          </MessagesProvider>
        </RoomsProvider>
      </AuthProvider>
    </SocketProvider>
  );
};

const RootApp: React.FC = () => {
  const { username } = useAuth();
  const showAuth = !username;

  return (
    <div className="app">
      {showAuth && <AuthModal />}
      <div className="sidebar">
        <RoomControls />
        <RoomList />
      </div>
      <ChatArea />
    </div>
  );
};

export default App;
