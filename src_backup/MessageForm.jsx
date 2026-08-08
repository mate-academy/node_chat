import { useState } from "react";
import axios from "axios";

function sendMessage(text, currentRoomId, username) {
  return axios.post(`http://localhost:3005/rooms/${currentRoomId}/message`, {
    text,
    author: username,
  });
}

export const MessageForm = ({ currentRoomId, username }) => {
  const [text, setText] = useState("");

  return (
    <form
      className="field is-horizontal"
      onSubmit={async (event) => {
        event.preventDefault();

        await sendMessage(text, currentRoomId, username);

        setText("");
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter a message"
        value={text}
        autoFocus
        onChange={(event) => setText(event.target.value)}
      />
      <button className="button">Send</button>
    </form>
  );
};
