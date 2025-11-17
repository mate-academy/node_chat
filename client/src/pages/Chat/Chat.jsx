import { useEffect, useState } from 'react';
import { socket } from '../../socket';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.scss';

export const ChatPage = () => {
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [isJoined, setIsJoined] = useState(false);
	const [newRoomName, setNewRoomName] = useState('');
	const [roomError, setRoomError] = useState('');
	const navigate = useNavigate();

	const { roomName } = useParams();
	const userName = localStorage.getItem('username');

	useEffect(() => {
		setIsJoined(false);

		socket.emit('join-room', roomName, userName);

		const roomMessagesCallback = msgs => setMessages(msgs);

		const newMessageCallback = msg => {
			setMessages(prev => [...prev, msg]);
		};
		const joinedRoomCallback = room => {
			if (room === roomName) setIsJoined(true);
		};
		const roomRenamedCallback = newRoomName => {
			navigate(`/chat-room/${newRoomName}`);
		};

		const roomDeletedCallback = () => {
			setIsJoined(false);
			setMessages([]);
			navigate('/chat-pannel');
		};

		const roomErrorCallback = message => {
			setRoomError(message);
		};

		const leavedRoomCallback = leavedId => {
			if (leavedId === socket.id) {
				setIsJoined(false);
				navigate('/chat-pannel');
			}
		};

		socket.on('room-messages', roomMessagesCallback);
		socket.on('new-message', newMessageCallback);
		socket.on('joined-room', joinedRoomCallback);
		socket.on('room-renamed', roomRenamedCallback);
		socket.on('room-deleted', roomDeletedCallback);
		socket.on('room-error', roomErrorCallback);
		socket.on('leaved-room', leavedRoomCallback);

		return () => {
			socket.off('room-messages', roomMessagesCallback);
			socket.off('new-message', newMessageCallback);
			socket.off('joined-room', joinedRoomCallback);
			socket.off('room-deleted', roomDeletedCallback);
			socket.off('room-renamed', roomRenamedCallback);
			socket.off('room-error', roomErrorCallback);
			socket.off('leaved-room', leavedRoomCallback);
		};
	}, [roomName, userName, navigate]);

	const handleSendMessage = () => {
		if (message.trim() && isJoined) {
			socket.emit('send-message', roomName, userName, socket.id, message);
			setMessage('');
		}
	};

	const handleLeaveRoom = () => {
		socket.emit('leave-room', roomName, socket.id);
	};

	const handleRenameRoom = () => {
		const normalizedRoomName = newRoomName.trim();

		if (!normalizedRoomName) {
			setRoomError('New room name is required');
			return;
		}
		setRoomError('');

		socket.emit('rename-room', roomName, newRoomName);
	};

	const handleDeleteRoom = () => {
		socket.emit('delete-room', roomName, socket.id);
	};

	const handleInputChange = e => {
		setRoomError('');
		setNewRoomName(e.target.value);
	};

	return (
		<div className={styles.chatPage}>
			<h1>Chat room: {roomName}</h1>
			<div className={styles.chatPage__messagesContainer}>
				<div className={styles.chatPage__messages}>
					{messages.map(msg => {
						const isAuthor = msg.id === socket.id;
						const messageContainerClass = isAuthor
							? `${styles.chatPage__messageContainer} ${styles['chatPage__messageContainer--author']}`
							: styles.chatPage__messageContainer;
						return (
							<div key={msg.time} className={messageContainerClass}>
								<p className={styles.chatPage__author}>
									{isAuthor ? 'You' : msg.author}
								</p>
								<div className={styles.chatPage__message}>
									<p>{msg.message}</p>
								</div>
								<span>{new Date(msg.time).toLocaleString('uk-UA')}</span>
							</div>
						);
					})}
				</div>
			</div>
			<textarea
				value={message}
				onChange={e => setMessage(e.target.value)}
				placeholder="Type your message here..."
				rows={2}
				className={styles.chatPage__messageInput}
			/>
			<button onClick={handleSendMessage} disabled={!isJoined}>
				Send
			</button>
			<div className={styles.chatPage__roomActions}>
				<input
					type="text"
					value={newRoomName}
					onChange={handleInputChange}
					onFocus={() => setRoomError('')}
				/>
				<button onClick={handleRenameRoom}>Rename room</button>
			</div>
			<div className={styles.chatPage__roomActions}>
				<button onClick={handleLeaveRoom}>Leave the chat</button>
				<button onClick={handleDeleteRoom}>Delete room</button>
			</div>

			<p className={styles.chatPage__error}>{roomError}</p>
		</div>
	);
};
