export const getRooms = async () => {
	const res = await fetch('http://localhost:3001/rooms');
	return res.json();
};
