import { HashRouter as Router, Routes, Route } from "react-router";
import App from "./App";
import { RegisterPage } from "./pages/RegisterPage";
import { ChatsPage } from "./pages/ChatsPage";
import { ChatPage } from "./pages/ChatPage";

export const Root = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<RegisterPage />} />
      <Route path="/" element={<App />}>
        <Route index element={<ChatsPage />} />
        <Route path="/:chatId" element={<ChatPage />} />
      </Route>
    </Routes>
  </Router>
);
