import "./App.css";

import { Router } from "./router/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="content">
      <Router />
      <ToastContainer />
    </div>
  );
};

export default App;
