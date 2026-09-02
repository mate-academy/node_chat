'use client';

import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useState,
} from 'react';

import { SendIcon } from '@/components/icons';

type MessageComposerProps = {
  roomName: string;
  isConnected: boolean;
  onSend: (text: string) => boolean;
  onMessageSent: () => void;
};

export function MessageComposer({
  roomName,
  isConnected,
  onSend,
  onMessageSent,
}: MessageComposerProps) {
  const [text, setText] = useState('');

  const normalizedText = text.trim();
  const isSendDisabled = !isConnected || normalizedText.length === 0;

  const composerHint = isConnected
    ? 'Press Enter to send · Shift + Enter for a new line'
    : 'Connecting to room...';

  function submitMessage() {
    if (onSend(text)) {
      setText('');
      onMessageSent();
    }
  }

  function handleTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setText(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  return (
    <form
      className="shrink-0 border-t bg-card px-3 py-3 sm:px-5 sm:py-4 lg:px-8"
      onSubmit={handleSubmit}
    >
      <div className="mx-auto flex w-full max-w-4xl items-end gap-2 sm:gap-3">
        <textarea
          aria-label={`Message #${roomName}`}
          className="max-h-32 min-h-10 min-w-0 flex-1 resize-none rounded-xl border bg-input px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 sm:max-h-36 sm:min-h-12 sm:px-4 sm:py-3 sm:text-base"
          disabled={!isConnected}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${roomName}`}
          rows={1}
          value={text}
        />

        <button
          aria-label="Send message"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:size-12"
          disabled={isSendDisabled}
          title="Send message"
          type="submit"
        >
          <SendIcon className="size-4 sm:size-5" />
        </button>
      </div>

      <p
        aria-live="polite"
        className="mt-1.5 text-center text-[10px] text-muted-foreground sm:mt-2 sm:text-xs"
      >
        {composerHint}
      </p>
    </form>
  );
}
