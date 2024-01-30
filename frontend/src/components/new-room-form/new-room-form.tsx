import axios, { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

export const NewRoomForm = () => {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setValue("");
      return;
    }

    axios
      .post("http://localhost:4000/rooms", {
        name: trimmedValue,
      })
      .then(() => {
        setValue("");
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input type="text" value={value} onChange={handleChange} />
        <button type="submit">Add</button>
      </div>
    </form>
  );
};
