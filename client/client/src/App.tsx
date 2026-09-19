import "./App.css";
import { RequireAuth } from "./components/RequireAuth";
import { GeneralChatPage } from "./pages/GeneralChatPage";

function App() {
  return (
      <RequireAuth>
        <GeneralChatPage />
      </RequireAuth>
  );
}

export default App;
