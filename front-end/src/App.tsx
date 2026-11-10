import { Navigate, Outlet } from "react-router";

function App() {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <h1 style={{ margin: 0, fontSize: "24px", textAlign: "center", fontFamily: "Arial, sans-serif", }}>
        Chats aplication
      </h1>
      <Outlet />
    </>
  );
}

export default App;
