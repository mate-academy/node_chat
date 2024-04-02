export const Room = ({ room, setRoom }) => {
  const handleRoomChange = (event) => {
    setRoom(event.target.value);
  };

  return (
    <>
      <h2>Room {room}</h2>
      <select onChange={handleRoomChange}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    </>
  );
};