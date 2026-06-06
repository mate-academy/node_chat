type Props = {
  username: string | null;
};

export const UserProfile: React.FC<Props> = ({ username }) => {
  return (
    <div className="chat-user-profile">
      <div className="user-profile-container">
        <span className="user-profile-avatar">{username && username[0]}</span>
        <span>
          <strong>{username}</strong>
        </span>
      </div>
    </div>
  );
};
