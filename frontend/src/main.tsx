import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { CurrentRoom } from "./components/current-room/CurrentRoom.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/chats/:chatId" element={<CurrentRoom />}></Route>
      </Routes>
    </Router>
  </StrictMode>
);
