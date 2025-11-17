import { useEffect, useState } from 'react';
import { socket } from '../../socket.js';
import { useNavigate } from 'react-router-dom';
import styles from './ChatPannel.module.scss';
import { getRooms } from '../../services/roomService.js';
import bubble from '../../images/bubble.png';

export const ChatPannel = () => {
	const [createdRoomName, setCreatedRoomName] = useState('');
	const [selectedRoomName, setSelectedRoomName] = useState('');
	const [roomList, setRoomList] = useState(null);
	const [roomNameError, setRoomNameError] = useState('');

	const navigate = useNavigate();

	const userName = localStorage.getItem('username');

	useEffect(() => {
		getRooms().then(data => setRoomList(data));
	}, []);

	useEffect(() => {
		const roomErrorCallback = message => {
			setRoomNameError(message);
		};
		const roomCreatedCallback = roomName => {
			setCreatedRoomName('');
			navigate(`/chat-room/${roomName}`);
		};

		const roomsUpdatedCallback = rooms => {
			setRoomList(rooms);
		};

		socket.on('room-error', roomErrorCallback);

		socket.on('room-created', roomCreatedCallback);

		socket.on('rooms-updated', roomsUpdatedCallback);

		return () => {
			socket.off('room-error', roomErrorCallback);
			socket.off('room-created', roomCreatedCallback);
			socket.off('rooms-updated', roomsUpdatedCallback);
		};
	}, [navigate]);

	const changeRoomName = e => {
		setRoomNameError('');
		setCreatedRoomName(e.target.value);
	};

	const handleCreateRoom = () => {
		const normalizedRoomName = createdRoomName.trim();

		if (!normalizedRoomName) {
			setRoomNameError('Room name is required');
			return;
		}

		setRoomNameError('');

		socket.emit('create-room', {
			roomName: normalizedRoomName,
			ownerName: userName,
		});
	};

	const changeSelectedRoomName = e => {
		setRoomNameError('');
		setSelectedRoomName(e.target.value);
	};

	const handleJoinRoom = () => {
		if (!selectedRoomName) {
			setRoomNameError('Please select a room to join');
			return;
		}
		setSelectedRoomName('');
		setRoomNameError('');
		navigate(`/chat-room/${selectedRoomName}`);
	};
	return (
		<div className={styles.chatPannel}>
			<div className={styles.chatPannel__container}>
				<h1>Select the chat room:</h1>
				{roomList === null ? (
					<p>Loading rooms...</p>
				) : (
					<>
						<select
							name="chatRoom"
							value={selectedRoomName}
							onChange={changeSelectedRoomName}
							onFocus={() => setRoomNameError('')}
						>
							<option value="" disabled hidden>
								Choose the room
							</option>
							{roomList.map(room => (
								<option key={room} value={room}>
									{room}
								</option>
							))}
						</select>
						<button onClick={handleJoinRoom}>Join</button>
					</>
				)}
				<p>OR create a new chat room</p>
				<input
					type="text"
					placeholder="Room name"
					onChange={changeRoomName}
					onFocus={() => setRoomNameError('')}
				/>
				<button onClick={handleCreateRoom}>Create</button>
				{roomNameError && (
					<p className={styles.chatPannel__error}>{roomNameError}</p>
				)}
				<img src={bubble} alt="chat bubble" />
			</div>
		</div>
	);
};
