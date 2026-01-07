import axios from "axios";
import { useState } from "react";
import { API } from "../App";

export const MessageForm = ({ authorName, roomId }) => {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    axios.post(`${API}/rooms/${roomId}/messages`, {
      author: authorName,
      text: text.trim(),
    });
  };

  return (
    <form
      className="field is-horizontal"
      onSubmit={async (event) => {
        event.preventDefault();

        await sendMessage();

        setText("");
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter a message"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button className="button">Send</button>
    </form>
  );
};
