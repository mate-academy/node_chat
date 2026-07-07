import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RoomDetail } from './pages/RoomDetail';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat/:roomId" element={<RoomDetail />} />
    </Routes>
  );
};
