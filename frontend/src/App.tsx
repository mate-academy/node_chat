import { useEffect, useState, type FormEvent } from "react";
import "./App.css";
import { useSocket } from "./hooks/use-socket.hook";
import { Rooms } from "./components/rooms/Rooms";

function App() {
  const [username, setUsername] = useState("");

  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (!localStorage.getItem("username")) {
      localStorage.setItem("username", "guest");
    } else {
      socket.emit("set-username", localStorage.getItem("username"));
    }
  }, [socketRef]);

  const handleChangeUsername = (event: FormEvent) => {
    event.preventDefault();
    const socket = socketRef.current;
    if (socket && username.trim() !== "") {
      socket.emit("set-username", username);
      localStorage.setItem("username", username);
    }
  };

  return (
    <div>
      <p>{`Your username: ${localStorage.getItem("username")}`}</p>
      <form onSubmit={handleChangeUsername}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <button type="submit">Change username</button>
      </form>
      <Rooms />
    </div>
  );
}

export default App;
