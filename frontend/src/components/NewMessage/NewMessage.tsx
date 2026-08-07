interface Props {
  newMessage: string;
  onMessageSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onMessageChange: (newTitle: string) => void;
  loading: boolean;
  messageInputRef: React.RefObject<HTMLTextAreaElement>;
}

export const NewMessage: React.FC<Props> = ({
  newMessage,
  onMessageSubmit,
  onMessageChange,
  loading,
  messageInputRef,
}) => {
  return (
    <header className="chatapp__header-container">
      <div className="chatapp__header">
        <form onSubmit={onMessageSubmit}>
          <textarea
            ref={messageInputRef}
            data-cy="NewelementField"
            className="chatapp__new-element"
            placeholder="Message"
            value={newMessage}
            disabled={loading}
            onChange={(event) => onMessageChange(event.target.value)}
          ></textarea>
          <button
            type="submit"
            className="chatapp__toggle-all"
            aria-label="Add message"
            title="Add message"
          >
            <span aria-hidden="true">➤</span>
          </button>
        </form>
      </div>
    </header>
  );
};
