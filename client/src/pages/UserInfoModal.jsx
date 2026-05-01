import './UserInfoModal.scss';

function UserInfoModal({ onClose, user }) {
  if (!user) {
    return null;
  }

  return (
    <div
      className="user-modal-overlay"
      role="button"
      tabIndex="0"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClose();
      }}
    >
      <div
        className="user-modal-content"
        role="button"
        tabIndex="-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.stopPropagation();
        }}
      >
        <div className="modal-header">
          <h2>User info</h2>
          <button type="button" className="button-close" onClick={onClose}>
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
