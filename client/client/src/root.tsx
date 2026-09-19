import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChatProvider } from "./ChatContext";
import { AuthorizationPage } from "./pages/AuthorizationPage";
import App from "./App";
import { RoomsPage } from "./pages/RoomsPage";
import { RequireAuth } from "./components/RequireAuth";
import { RoomDetailsPage } from "./pages/RoomDetailsPage";

export const Root = () => {
  return (
    <BrowserRouter>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<AuthorizationPage />} />
          <Route
            path="/rooms"
            element={
              <RequireAuth>
                <RoomsPage />
              </RequireAuth>
            }
          />
          <Route path="/rooms/:roomId" element={<RoomDetailsPage />} />
        </Routes>
      </ChatProvider>
    </BrowserRouter>
  );
};
