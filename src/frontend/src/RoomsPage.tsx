import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import DeleteRoomDialog from './DeleteRoomDialog';
import RoomControlSheet from './RoomControlSheet';
import RenameRoomDialog from './RenameRoomDialog';
import type { Room } from './types';
import useRoomsPage from './useRoomsPage';

const mobileRoomsMedia = '(max-width: 520px)';

function isMobileRoomsViewport() {
  return globalThis.matchMedia?.(mobileRoomsMedia).matches ?? false;
}

function RoomsPage() {
  const {
    canManageRoom,
    deleteConfirmation,
    deleteDialogOpen,
    deleteTarget,
    error,
    handleCreateRoom,
    handleDeleteDialogOpenChange,
    handleDeleteRoom,
    handleLeaveRoom,
    handleRenameDialogOpenChange,
    handleRenameRoom,
    isCreatingRoom,
    openDeleteModal,
    openRenameModal,
    renameRoom,
    renameDialogOpen,
    renameName,
    renameTarget,
    search,
    setDeleteConfirmation,
    setIsCreatingRoom,
    setRenameName,
    setSearch,
    visibleRooms,
  } = useRoomsPage();
  const [mobileSheetRoomName, setMobileSheetRoomName] = useState<string | null>(
    null,
  );
  const mobileSheetRoom = useMemo(
    () =>
      visibleRooms.find((room) => room.name === mobileSheetRoomName) ?? null,
    [mobileSheetRoomName, visibleRooms],
  );
  const canManageMobileSheetRoom = mobileSheetRoom
    ? canManageRoom(mobileSheetRoom)
    : false;

  useEffect(() => {
    if (globalThis.matchMedia === undefined) {
      return;
    }

    const media = globalThis.matchMedia(mobileRoomsMedia);
    const closeSheetOnDesktop = () => {
      if (!media.matches) {
        setMobileSheetRoomName(null);
      }
    };

    closeSheetOnDesktop();
    media.addEventListener('change', closeSheetOnDesktop);

    return () => media.removeEventListener('change', closeSheetOnDesktop);
  }, []);

  const openMobileSheet = (room: Room) => {
    if (!isMobileRoomsViewport()) {
      return;
    }

    setMobileSheetRoomName(room.name);
  };

  const closeMobileSheet = () => setMobileSheetRoomName(null);

  const handleMobileSheetOpenChange = (open: boolean) => {
    if (!open) {
      closeMobileSheet();
    }
  };

  const handleMobileLeaveRoom = async (room: Room) => {
    await handleLeaveRoom(room);
    closeMobileSheet();
  };

  const handleMobileDeleteRoom = (room: Room) => {
    closeMobileSheet();
    openDeleteModal(room);
  };

  return (
    <main className="rooms-page">
      <header className="rooms-topbar">
        <a href="/chat">back to chat</a>
        <h1>
          <span className="desktop-title">All rooms</span>
          <span className="mobile-title">Rooms</span>
        </h1>
        <button
          className="app-icon-button"
          type="button"
          onClick={() => setIsCreatingRoom(true)}
        >
          +
        </button>
      </header>

      <section className="rooms-content">
        <h2 id="rooms-title">Rooms</h2>
        <div className="rooms-search-row">
          <label htmlFor="room-search">Search rooms</label>
          <input
            id="room-search"
            placeholder="Search rooms..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            className={classNames('app-button', 'primary')}
            type="button"
            onClick={() => setIsCreatingRoom(true)}
          >
            + New room
          </button>
        </div>

        {error ? <p className="rooms-status error">{error}</p> : null}

        {isCreatingRoom ? (
          <form className="room-create-panel" onSubmit={handleCreateRoom}>
            <label htmlFor="room-name">Room name</label>
            <input id="room-name" name="roomName" placeholder="new-room" />
            <div>
              <button
                className="app-button"
                type="button"
                onClick={() => setIsCreatingRoom(false)}
              >
                cancel
              </button>
              <button
                className={classNames('app-button', 'primary')}
                type="submit"
              >
                create
              </button>
            </div>
          </form>
        ) : null}

        <ol className="all-room-list">
          {visibleRooms.map((room) => {
            const canManage = canManageRoom(room);

            return (
              <li
                className={classNames('all-room-row', {
                  active: mobileSheetRoomName === room.name,
                })}
                key={room.name}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') {
                    openMobileSheet(room);
                  }
                }}
              >
                <a
                  className="room-summary"
                  href={`/chat#${encodeURIComponent(room.name)}`}
                  onClick={(event) => {
                    if (!isMobileRoomsViewport()) {
                      return;
                    }

                    event.preventDefault();
                    openMobileSheet(room);
                  }}
                  onFocus={() => openMobileSheet(room)}
                >
                  <span className="room-summary-main">
                    <span>#</span>
                    <strong>{room.name}</strong>
                    <small>{room.members} members</small>
                  </span>
                  <span className="room-summary-preview">
                    <span>{room.preview || 'No messages yet'}</span>
                    <time>{room.time}</time>
                    {room.unread ? <strong>{room.unread}</strong> : null}
                  </span>
                </a>

                <div className="room-actions">
                  <button
                    className="app-button"
                    disabled={!canManage}
                    title={
                      canManage
                        ? 'Rename room'
                        : 'Only the room creator can rename it'
                    }
                    type="button"
                    onClick={() => openRenameModal(room)}
                  >
                    rename
                  </button>
                  <button
                    className={classNames('app-button', 'danger')}
                    disabled={!room.joined}
                    title={
                      room.joined
                        ? 'Leave room'
                        : 'Join the room before leaving it'
                    }
                    type="button"
                    onClick={() => handleLeaveRoom(room)}
                  >
                    leave
                  </button>
                  <button
                    className={classNames('app-button', 'danger')}
                    disabled={!canManage}
                    title={
                      canManage
                        ? 'Delete room'
                        : 'Only the room creator can delete it'
                    }
                    type="button"
                    onClick={() => openDeleteModal(room)}
                  >
                    delete
                  </button>
                  <a
                    className="app-button"
                    href={`/chat#${encodeURIComponent(room.name)}`}
                  >
                    {room.joined ? 'open' : 'join'}
                  </a>
                </div>
              </li>
            );
          })}
        </ol>

        {visibleRooms.length ? null : (
          <p className="rooms-status">No rooms found.</p>
        )}
      </section>

      <RoomControlSheet
        key={mobileSheetRoom?.name ?? 'closed'}
        canManageRoom={canManageMobileSheetRoom}
        room={mobileSheetRoom}
        onOpenChange={handleMobileSheetOpenChange}
        onRenameRoom={renameRoom}
        onLeaveRoom={handleMobileLeaveRoom}
        onDeleteRoom={handleMobileDeleteRoom}
      />

      {renameTarget ? (
        <RenameRoomDialog
          name={renameName}
          room={renameTarget}
          open={renameDialogOpen}
          onOpenChange={handleRenameDialogOpenChange}
          onNameChange={setRenameName}
          onSubmit={handleRenameRoom}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteRoomDialog
          confirmation={deleteConfirmation}
          room={deleteTarget}
          open={deleteDialogOpen}
          onOpenChange={handleDeleteDialogOpenChange}
          onConfirmationChange={setDeleteConfirmation}
          onSubmit={handleDeleteRoom}
        />
      ) : null}
    </main>
  );
}

export default RoomsPage;
