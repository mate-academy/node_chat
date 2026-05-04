import type { SubmitEvent } from 'react';
import type { Room } from './types';

type MessageComposerProps = {
  activeRoom: Room | undefined;
  messageText: string;
  onMessageTextChange: (messageText: string) => void;
  onPostMessage: (event: SubmitEvent<HTMLFormElement>) => void;
};

function MessageComposer({
  activeRoom,
  messageText,
  onMessageTextChange,
  onPostMessage,
}: MessageComposerProps) {
  return (
    <form className="composer" onSubmit={onPostMessage}>
      <label htmlFor="message">
        {activeRoom ? `Message #${activeRoom.name}` : 'Message'}
      </label>
      <input
        disabled={!activeRoom}
        id="message"
        name="message"
        placeholder={
          activeRoom ? `Message #${activeRoom.name}...` : 'Create a room...'
        }
        value={messageText}
        onChange={(event) => onMessageTextChange(event.target.value)}
      />
    </form>
  );
}

export default MessageComposer;
