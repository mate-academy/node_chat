import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { HomePage } from './pages/HomePage/HomePage';
import { ChatPage } from './pages/Chat/Chat';
import { ChatPannel } from './pages/ChatPannel/ChatPannel';

export const Root = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path={'/'} element={<App />}>
					<Route index element={<HomePage />} />
					<Route path="/chat-pannel" element={<ChatPannel />} />
					<Route path="/chat-room/:roomName" element={<ChatPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
