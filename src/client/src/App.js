import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';

const ws = new WebSocket('ws://localhost:5000');

const messagesReducer = (state, action) => {
    switch (action.type) {
        case "ADD_MESSAGES":
            return [...state, ...action.messages];
        case "ADD_MESSAGE":
            return [...state, action.message];
        case "CLEAR":
            return [];
        default:
            return state;
    }
};

const ChatMessage = React.memo(({ message }) => (
    <p>
        <strong>{message.author}</strong> [{message.time}]: {message.text}
    </p>
));

function ChatApp() {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [joined, setJoined] = useState(false);
    const [messages, dispatch] = useReducer(messagesReducer, []);

    useEffect(() => {
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "history") {
                dispatch({ type: "ADD_MESSAGES", messages: data.messages });
            } else if (data.type === "message") {
                dispatch({ type: "ADD_MESSAGE", message: data.message });
            } else if (data.type === "deleted") {
                alert('Кімната була видалена!');
                setRoom('');
                dispatch({ type: "CLEAR" });
                setJoined(false);
            }
        };
    }, []);

    const createRoom = useCallback(() => {
        if (room.trim()) {
            ws.send(JSON.stringify({ type: "create", room }));
        }
    }, [room]);

    const joinRoom = useCallback(() => {
        if (room.trim() && username.trim()) {
            ws.send(JSON.stringify({ type: "join", room, username }));
            setJoined(true);
        }
    }, [room, username]);

    const renameRoom = useCallback((newRoom) => {
        if (newRoom.trim() && room.trim()) {
            ws.send(JSON.stringify({ type: "rename", oldRoom: room, newRoom }));
            setRoom(newRoom);
        }
    }, [room]);

    const deleteRoom = useCallback(() => {
        if (room.trim()) {
            ws.send(JSON.stringify({ type: "delete", room }));
            setRoom('');
            setJoined(false);
        }
    }, [room]);

    const sendMessage = useCallback(() => {
        if (message.trim()) {
            ws.send(JSON.stringify({ type: "message", text: message }));
            setMessage('');
        }
    }, [message]);

    const memoizedMessages = useMemo(() => {
        return messages.map((msg, index) => <ChatMessage key={index} message={msg} />);
    }, [messages]);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            {!username ? (
                <div>
                    <h2>Введіть ваше ім'я:</h2>
                    <input type="text" onChange={(e) => setUsername(e.target.value)} placeholder="Ваше ім'я" />
                    <button onClick={() => localStorage.setItem("username", username)}>Зберегти</button>
                </div>
            ) : !joined ? (
                <div>
                    <h2>Виберіть або створіть кімнату:</h2>
                    <input type="text" onChange={(e) => setRoom(e.target.value)} placeholder="Назва кімнати" />
                    <button onClick={createRoom}>Створити</button>
                    <button onClick={joinRoom}>Приєднатися</button>
                </div>
            ) : (
                <div>
                    <h1>Чат кімнати: {room}</h1>
                    <div style={{ height: "300px", overflowY: "scroll", border: "1px solid #ccc", padding: "10px" }}>
                        {memoizedMessages}
                    </div>
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Напишіть повідомлення..." />
                    <button onClick={sendMessage}>Відправити</button>
                    <hr />
                    <input type="text" onChange={(e) => renameRoom(e.target.value)} placeholder="Нова назва кімнати" />
                    <button onClick={() => renameRoom(room)}>Перейменувати</button>
                    <button onClick={deleteRoom}>Видалити кімнату</button>
                </div>
            )}
        </div>
    );
}

export default ChatApp;
