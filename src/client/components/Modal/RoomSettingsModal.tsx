import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useChat } from '../ChatContext';

import { Modal } from './Modal';

export const RoomSettingsModal = () => {
  const navigate = useNavigate();
  const { selectedRoom } = useChat();

  const handleCloseModal = () => navigate(`/rooms/${selectedRoom?.id}`);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Modal isOpen={true} onClose={handleCloseModal}>
      <aside className={`box modal_box ${isVisible ? 'open' : ''}`}>
        <header className="modal_header">
          <h2 className="title is-4">Room settings</h2>
          <button className="delete is-medium" onClick={handleCloseModal} />
        </header>

        <Outlet />
      </aside>
    </Modal>
  );
};
