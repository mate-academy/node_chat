import { useContext, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { AppContext } from "./context/appContext";
import Profile from "./components/Profile/Profile";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";

function App() {
  //#region Get user from context
  const { setUser } = useContext(AppContext);
  //#endregion

  //#region Check storage
  useEffect(() => {
    const userFromStorage = localStorage.getItem("chatUser");

    if (userFromStorage) {
      setUser(JSON.parse(userFromStorage));
    }
  }, []);
  //#endregion

  //#region Render
  return (
    <div className="App">
      <ToastContainer />

      <Profile />
    </div>
  );
  //#endregion
}

export default App;
