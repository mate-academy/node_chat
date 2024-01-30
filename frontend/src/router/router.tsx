import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/login/login";
import { ChatPage } from "../pages/chat/chat";
import { PrivateRoute } from "../components/private-route/private-route";

export const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to={"/chat"} />} />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      >
        <Route path=":chatName" />
      </Route>
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};
