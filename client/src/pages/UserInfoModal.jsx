import './UserInfoModal.scss';

function UserInfoModal({ onClose, user }) {
  if (!user) {
    return null;
  }
  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User info</h2>
          <button className="button-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="items-block">
          <div className="user-item">User name: {user.name}</div>
          <div className="user-item">User phone: {user.phone}</div>
          <div className="user-item">User email: {user.email}</div>
        </div>
      </div>
    </div>
  );
}

export default UserInfoModal;
