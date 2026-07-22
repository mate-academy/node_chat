import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { Chat } from "./modules/Chat/Chat";

export const Rousers = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App></App>}>
          <Route index element={<Chat key={'default'}/>}/>
          <Route path={":roomId"} element={<Chat/>}>
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
};

