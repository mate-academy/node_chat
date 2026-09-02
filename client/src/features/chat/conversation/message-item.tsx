'use client';

import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { MoreHorizontalIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

type MessageMode = 'idle' | 'editing' | 'deleting' | 'removing';

type MessageItemProps = {
  message: ChatMessage;
  isOwnMessage: boolean;
  onEdit: (messageId: string, text: string) => boolean;
  onDelete: (messageId: string) => boolean;
};

const PANEL_ANIMATION_DURATION = 300;
const DELETE_ANIMATION_DURATION = 220;

export function MessageItem({
  message,
  isOwnMessage,
  onEdit,
  onDelete,
}: MessageItemProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const editingInputRef = useRef<HTMLTextAreaElement | null>(null);
  const editingControlsRef = useRef<HTMLDivElement | null>(null);
  const deletionControlsRef = useRef<HTMLDivElement | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mode, setMode] = useState<MessageMode>('idle');
  const [editingText, setEditingText] = useState(message.text);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isEditing = mode === 'editing';
  const isDeleting = mode === 'deleting';
  const isRemoving = mode === 'removing';

  const normalizedEditingText = editingText.trim();

  const isSaveDisabled =
    !isEditing ||
    normalizedEditingText.length === 0 ||
    normalizedEditingText === message.text;

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const messageClassName = cn(
    'group -mx-2 flex min-w-0 gap-2.5 rounded-xl px-2 transition-[max-height,opacity,transform,background-color,padding] ease-out motion-reduce:transition-none sm:-mx-3 sm:gap-4 sm:px-3',
    isRemoving
      ? 'max-h-0 translate-x-6 overflow-hidden py-0 opacity-0 duration-200'
      : 'max-h-[40rem] translate-x-0 overflow-visible py-2 opacity-100 duration-300 hover:bg-muted/30 sm:py-3',
  );

  const actionsMenuClassName = cn(
    'absolute bottom-full right-0 z-20 mb-1 min-w-32 origin-bottom-right overflow-hidden rounded-xl border bg-card p-1 shadow-lg transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none sm:left-0 sm:right-auto sm:origin-bottom-left',
    isMenuOpen
      ? 'visible translate-y-0 scale-100 opacity-100'
      : 'invisible pointer-events-none translate-y-1 scale-95 opacity-0',
  );

  const messageTextClassName = cn(
    'grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out motion-reduce:transition-none',
    isEditing
      ? 'grid-rows-[0fr] -translate-y-1 opacity-0'
      : 'grid-rows-[1fr] translate-y-0 opacity-100',
  );

  const editingPanelClassName = cn(
    'grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out motion-reduce:transition-none',
    isEditing
      ? 'grid-rows-[1fr] translate-y-0 opacity-100'
      : 'pointer-events-none grid-rows-[0fr] -translate-y-2 opacity-0',
  );

  const deletionPanelClassName = cn(
    'grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out motion-reduce:transition-none',
    isDeleting
      ? 'grid-rows-[1fr] translate-y-0 opacity-100'
      : 'pointer-events-none grid-rows-[0fr] -translate-y-2 opacity-0',
  );

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && !menuRef.current?.contains(target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!isEditing && !isDeleting) {
      return;
    }

    const controls = isEditing
      ? editingControlsRef.current
      : deletionControlsRef.current;

    const animationFrame = requestAnimationFrame(() => {
      if (isEditing) {
        editingInputRef.current?.focus();
        editingInputRef.current?.select();
      }

      controls?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });

    const finalScrollTimer = window.setTimeout(() => {
      controls?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, PANEL_ANIMATION_DURATION);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(finalScrollTimer);
    };
  }, [isDeleting, isEditing]);

  function toggleActionsMenu() {
    setIsMenuOpen((currentValue) => !currentValue);
  }

  function handleEditingTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setEditingText(event.target.value);
  }

  function startEditing() {
    setEditingText(message.text);
    setIsMenuOpen(false);
    setMode('editing');
  }

  function cancelEditing() {
    setEditingText(message.text);
    setMode('idle');
  }

  function saveEditedMessage() {
    if (!normalizedEditingText || normalizedEditingText === message.text) {
      return;
    }

    if (onEdit(message.id, normalizedEditingText)) {
      setMode('idle');
    }
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();

      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEditedMessage();
    }
  }

  function requestDeletion() {
    setIsMenuOpen(false);
    setMode('deleting');
  }

  function cancelDeletion() {
    setMode('idle');
  }

  function confirmDeletion() {
    setMode('removing');

    deleteTimerRef.current = setTimeout(() => {
      const deletionStarted = onDelete(message.id);

      if (!deletionStarted) {
        setMode('idle');
      }

      deleteTimerRef.current = null;
    }, DELETE_ANIMATION_DURATION);
  }

  return (
    <article className={messageClassName}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold sm:size-11 sm:text-base">
        {message.authorName.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 sm:gap-x-2">
          <h3 className="max-w-[50%] truncate text-sm font-semibold sm:max-w-[60%] sm:text-base">
            {message.authorName}
          </h3>

          {isOwnMessage && (
            <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary sm:px-2 sm:text-xs">
              You
            </span>
          )}

          <time
            className="shrink-0 text-[10px] text-muted-foreground sm:text-xs"
            dateTime={message.createdAt}
          >
            {formattedTime}
          </time>

          {message.editedAt && (
            <>
              <span
                aria-hidden="true"
                className="text-[10px] text-muted-foreground sm:text-xs"
              >
                ·
              </span>

              <span className="shrink-0 text-[10px] text-muted-foreground sm:text-xs">
                edited
              </span>
            </>
          )}

          {isOwnMessage && !isEditing && !isDeleting && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                aria-expanded={isMenuOpen}
                aria-label="Message actions"
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-100 transition-[background-color,color,opacity,transform] duration-200 hover:scale-105 hover:bg-muted hover:text-foreground active:scale-95 sm:opacity-0 sm:group-hover:opacity-100"
                onClick={toggleActionsMenu}
                type="button"
              >
                <MoreHorizontalIcon className="size-4" />
              </button>

              <div aria-hidden={!isMenuOpen} className={actionsMenuClassName}>
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted"
                  onClick={startEditing}
                  tabIndex={isMenuOpen ? 0 : -1}
                  type="button"
                >
                  Edit
                </button>

                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/5"
                  onClick={requestDeletion}
                  tabIndex={isMenuOpen ? 0 : -1}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={messageTextClassName}>
          <div className="min-h-0 overflow-hidden">
            <p className="mt-1 break-words whitespace-pre-wrap text-sm text-muted-foreground sm:text-base">
              {message.text}
            </p>
          </div>
        </div>

        <div className={editingPanelClassName}>
          <div className="min-h-0 overflow-hidden">
            <div className="pt-2">
              <textarea
                className="max-h-36 min-h-16 w-full resize-y rounded-xl border bg-input px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/30 sm:max-h-40 sm:min-h-20 sm:px-4 sm:py-3 sm:text-base"
                disabled={!isEditing}
                maxLength={5000}
                onChange={handleEditingTextChange}
                onKeyDown={handleEditKeyDown}
                ref={editingInputRef}
                value={editingText}
              />

              <div
                className="mt-2 flex scroll-mb-4 items-center justify-end gap-2"
                ref={editingControlsRef}
              >
                <button
                  className="rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted active:scale-95 sm:text-sm"
                  disabled={!isEditing}
                  onClick={cancelEditing}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  disabled={isSaveDisabled}
                  onClick={saveEditedMessage}
                  type="button"
                >
                  Save
                </button>
              </div>

              <p className="mt-1 text-right text-[10px] text-muted-foreground sm:text-xs">
                Enter to save · Shift + Enter for a new line · Esc to cancel
              </p>
            </div>
          </div>
        </div>

        <div className={deletionPanelClassName}>
          <div className="min-h-0 overflow-hidden">
            <div
              className="mt-3 grid scroll-mb-4 grid-cols-2 gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 sm:flex sm:flex-wrap sm:items-center sm:gap-3"
              ref={deletionControlsRef}
            >
              <p className="col-span-2 min-w-0 text-xs text-destructive sm:flex-1 sm:text-sm">
                Delete this message permanently?
              </p>

              <button
                className="rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted active:scale-95 sm:text-sm"
                disabled={!isDeleting}
                onClick={cancelDeletion}
                type="button"
              >
                Cancel
              </button>

              <button
                className="rounded-lg bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground transition active:scale-95 sm:text-sm"
                disabled={!isDeleting}
                onClick={confirmDeletion}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
