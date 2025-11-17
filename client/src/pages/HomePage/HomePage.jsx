import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.scss';

export const HomePage = () => {
	const [username, setUsername] = useState('');
	const [userNameError, setUserNameError] = useState('');

	const navigate = useNavigate();

	useEffect(() => {
		const storedUsername = localStorage.getItem('username');
		if (storedUsername) {
			navigate('/chat-pannel');
		}
	}, [navigate]);

	const changeUserName = e => {
		setUsername(e.target.value);
	};

	const handleSaveName = () => {
		const normalizedUsername = username.trim();

		if (!normalizedUsername) {
			setUserNameError('Username is required');
			setUsername('');
			return;
		}

		localStorage.setItem('username', normalizedUsername);

		setUsername(normalizedUsername);
		setUserNameError('');
		navigate('/chat-pannel');
	};

	return (
		<div className={styles.homePage}>
			<div className={styles.homePage__container}>
				<h1>Welcome to the Chat App</h1>

				<p>Please enter your username to continue:</p>

				<input
					name="username"
					value={username}
					onChange={changeUserName}
					onFocus={() => setUserNameError('')}
					type="text"
					placeholder="Username"
				/>
				<button onClick={handleSaveName}>Next</button>
				{userNameError && (
					<p className={styles.homePage__error}>{userNameError}</p>
				)}
			</div>
		</div>
	);
};
