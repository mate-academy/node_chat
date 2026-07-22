import { createContext, useContext, useState, type ReactNode } from "react";
import { useMedia } from "./mediaContext";

type SideMenuContextType = {
  leftMenu: boolean;
  setLeftMenu: React.Dispatch<React.SetStateAction<boolean>>;
  rightMenu: boolean;
  setRightMenu: React.Dispatch<React.SetStateAction<boolean>>;
};

const SideMenuContext = createContext<SideMenuContextType | null>(null);

export function SideMenuProvider({ children }: { children: ReactNode }) {
  const [rightMenu, setRightMenu] = useState(false);

  const {isDesktop} = useMedia();

  const [leftMenu, setLeftMenu] = useState(isDesktop);

  return (
    <SideMenuContext.Provider value={{ leftMenu, setLeftMenu, rightMenu, setRightMenu}}>
      {children}
    </SideMenuContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSideMenu() {
  const context = useContext(SideMenuContext);

  if (!context) {
    throw new Error("useSideMenu must be used within SideMenuProvider");
  }

  return context;
}

