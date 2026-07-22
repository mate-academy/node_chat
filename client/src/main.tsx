import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Rousers } from "./Routers.tsx";
import { AuthProvider } from "./store/authContext.tsx";
import { MediaProvider } from "./store/mediaContext.tsx";
import { SideMenuProvider } from "./store/sideMenuContext.tsx";
import { RoomMessageProvider } from "./store/roomMessageContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <MediaProvider>
        <SideMenuProvider>
          <RoomMessageProvider>
            <Rousers />
          </RoomMessageProvider>
        </SideMenuProvider>
      </MediaProvider>
    </AuthProvider>
  </StrictMode>
);

