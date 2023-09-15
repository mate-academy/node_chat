import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/appContext";
import { Form } from "reactstrap";
import { notificationService } from "../../services/notificationService";
import "./ChatInput.scss";

function ChatInput({ sendMessage = () => {} }) {
  //#region Get user from app context
  const { user } = useContext(AppContext);
  //#endregion

  //#region Get room from app context
  const { currentRoom } = useContext(AppContext);
  //#endregion

  //#region State with data
  const [text, setText] = useState("");
  //#endregion

  //#region Function for text input value change
  const handleChange = (e) => {
    setText(e.target.value);
  };
  //#endregion

  //#region Clear text if roomId changed
  useEffect(() => {
    setText("");
  }, [currentRoom?.id]);
  //#endregion

  //#region Function for send message
  const addMessage = async (event) => {
    event.preventDefault();

    try {
      if (!text) {
        return;
      }

      const message = {
        authorName: user.fullName,
        roomId: currentRoom.id,
        userId: user.id,
        text,
      };

      await sendMessage(JSON.stringify(message));

      setText("");
    } catch (error) {
      notificationService.showError("Something went wrong");
    }
  };
  //#endregion

  //#region Render
  return (
    <Form className={"chat-input"} onSubmit={addMessage}>
      <div className={"chat-input__field-wrap"}>
        <input
          className={"chat-input__field"}
          value={text}
          onChange={handleChange}
          placeholder="Enter message..."
        />
      </div>

      <button type={"submit"} className={"chat-input__button"}></button>
    </Form>
  );
  //#endregion
}

export default ChatInput;
