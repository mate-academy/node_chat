import { FC, useRef, useState } from "react";
import { Room } from "../../types/room";
import { Avatar } from "../avatar";
import axios from "axios";

import "./current-room.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type Props = {
  room: Room;
};

export const CurrentRoom: FC<Props> = ({ room }) => {
  const { id, name, color } = room;
  const navigate = useNavigate();

  const [value, setValue] = useState(name);
  const [isEdit, setIsEdit] = useState(false);

  const ref = useRef<HTMLInputElement>(null);

  const handleDeleteRoom = () => {
    axios.delete(`http://localhost:4000/rooms/${id}`).catch((err) => {
      toast.error(err.message);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const startEdit = () => {
    setIsEdit(true);
    setTimeout(() => {
      ref.current?.focus();
    }, 0);
  };

  const handleUpdateRoom = () => {
    const newName = value.trim();

    if (newName === name || !newName) {
      return setIsEdit(false);
    }

    axios
      .patch(`http://localhost:4000/rooms/${id}`, { name: newName })
      .then(() => {
        navigate(`/chat/${newName}`);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleUpdateRoom();
  };

  return (
    <>
      <Avatar name={name} backgroundColor={color} />
      {isEdit ? (
        <form onSubmit={handleSubmit}>
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            className="current-room__input"
            onBlur={handleUpdateRoom}
          />
        </form>
      ) : (
        <div onDoubleClick={startEdit}>{name}</div>
      )}
      <button
        className="current-room__button"
        onClick={() => handleDeleteRoom()}
      >
        Delete room
      </button>
    </>
  );
};
