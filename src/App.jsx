/* eslint-disable */
import { useEffect, useState } from "react"
import { MessagesList } from "./components/MessagesList.jsx";

const socket = new WebSocket(`ws://localhost:3232`);

const messagesDiv = document.getElementById("messages");

export const App = () => {
  const [name, setName ] = useState('');
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.onopen = () => {
      console.log("Conectado ao servidor!");
    };

    socket.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };
  }, []);

  function handleSaveName() {
    if (!name.trim()) return alert("Campo nome vazio!");

    localStorage.setItem("Name", name);
    alert("Nome salvo com sucesso!");
  }

  function sendMessage() {
    if (!message.trim()) return;

    const date = new Date();

    socket.send(`${name}: ${message} - ${date.getHours()}:${date.getMinutes()}`);
    setMessage("");
  }

  return (
    <div>
      {name === "" && (
        <div>
          <input
            type="text"
            placeholder="Digite seu nome..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button onClick={handleSaveName}>Validar</button>
        </div>
      )}

      {name !== "" && (
        <div>
          <input
            id="msg"
            type="text"
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button onClick={sendMessage}>Enviar</button>

          <MessagesList list={messages} />
        </div>
      )}
    </div>
  )
}
