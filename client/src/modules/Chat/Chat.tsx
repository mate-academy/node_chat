import {
  useEffect,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clientApi } from "../../api/clientApi";
import { Button } from "../../shared/Button/Button";
import {
  EllipsisIcon,
  MenuIcon,
  PencilLineIcon,
  SendIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useSideMenu } from "../../store/sideMenuContext";
import { cn } from "../../lib/cn";
import { useOnClickOutside } from "usehooks-ts";
import { Messages } from "../Messages/Messages";
import { ModuleUsersRoom } from "../ModuleUsersRoom/ModuleUsersRoom";
import { useRoomMessage } from "../../store/roomMessageContext";
import { useAuth } from "../../store/authContext";
import { useMedia } from "../../store/mediaContext";

export const Chat: FC = () => {
  const params = useParams();
  const roomId = params.roomId;

  const navigation = useNavigate();
  const { isDesktop } = useMedia();
  const { currentRoom, rooms, setCurrentRoom } = useRoomMessage();
  const [error, setError] = useState("");
  const [openRename, setOpenRename] = useState(false);
  const { user } = useAuth();

  const [openUsers, setOpenUsers] = useState(false);

  const [text, setText] = useState("");

  const { leftMenu, setLeftMenu } = useSideMenu();

  const openRenameRef = useRef<HTMLDivElement | null>(null);

  const focusRenameRoomRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (openRename && focusRenameRoomRef) {
      focusRenameRoomRef.current?.focus();
    }
  }, [openRename]);

  useOnClickOutside(openRenameRef as React.RefObject<HTMLDivElement>, () => {
    setOpenRename(false);
  });

  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    if (roomId) {
      clientApi
        .getRoom(roomId)
        .then((res) => {
          setCurrentRoom(res.data);
          setError("");
        })
        .catch(() => {
          setCurrentRoom(null);
          navigation("/");
        });
    }

    return () => {
      setCurrentRoom(null);
    };
  }, [roomId, setCurrentRoom, rooms, navigation]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="h-full flex-1 flex flex-col">
      <header className=" bg-(--bg) sticky top-0 px-2 md:px-8 shadow-sm flex items-center gap-4 py-2 justify-between">
        <Button
          onClick={() => {
            setLeftMenu(!leftMenu);
          }}
          className=" block lg:hidden"
          leftIcon={<MenuIcon size={22} />}
        ></Button>
        <div className="flex items-baseline-last gap-4 flex-wrap gap-y-0">
          <h1 className=" block h-fit">
            {currentRoom ? `Welcome to ${currentRoom.name}!` : "Choose room"}
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div ref={openRenameRef}>
            <Button
              disabled={
                !currentRoom || (user && currentRoom.ownerId !== user.id) || false
              }
              onClick={() => {
                setOpenRename(true);
              }}
              className="flex"
              variant="outline"
              leftIcon={<PencilLineIcon size={18} />}
            >
              {isDesktop ? 'Rename' : ''}
            </Button>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const value = (
                  e.currentTarget.querySelector(
                    "#renameRoom"
                  ) as HTMLInputElement
                ).value;
                if (!roomId) {
                  return;
                }
                await clientApi.renameRoom(roomId, value);
                setOpenRename(false);
              }}
              className={cn(
                " flex flex-col gap-1 pointer-events-none px-1 py-1 rounded-[4px] shadow-[0px_0px_5px_5px_rgba(0,0,0,0.4)] bg-(--bg) text-(--text-h)  absolute bottom-0 z-80 opacity-0 transition-all",
                {
                  "pointer-events-auto opacity-100 translate-y-3/3": openRename,
                }
              )}
            >
              <label className="text-[14px]" htmlFor="renameRoom">
                Name:
              </label>
              <input
                ref={focusRenameRoomRef}
                id={"renameRoom"}
                name="name"
                className=" text-(text-h) font-[500] bg-(--bg) min-w-[0px] max-w-[600px] w-full rounded-[8px] px-2 py-1 scrollbar-none max-h-[100px] resize-none border border-black/30"
                type="text"
              />
            </form>
          </div>

          <Button
            disabled={!currentRoom || (user && currentRoom.ownerId !== user.id) || false}
            onClick={() => {
              if (!roomId) {
                return;
              }
              clientApi.deleteRoom(roomId);
              navigation("/");
            }}
            className="flex"
            variant="danger"
            leftIcon={<Trash2Icon size={18} />}
          >
            {isDesktop ? 'Delete Room' : ''}
            
          </Button>
          <Button
            onClick={() => setOpenUsers(true)}
            disabled={!currentRoom}
            className=" hidden lg:flex"
            variant="outline"
            leftIcon={<UsersIcon size={18} />}
          >
            {currentRoom ? currentRoom.usersId.length + 1 : 0}
          </Button>

          <Button
            onClick={() => {}}
            className=" block lg:hidden"
            leftIcon={<EllipsisIcon size={22} />}
            variant="outline"
          ></Button>
        </div>
      </header>
      <Messages roomId={roomId || null} error={error} />
      <footer className="sticky bottom-0 bg-(--bg2) shadow-[-1px_0px_3px_3px_rgba(0,0,0,0.1)] mt-auto ">
        <form
          className=" flex gap-2 px-4 py-2 md:px-10 md:py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (textareaRef && textareaRef.current && roomId) {
              clientApi.createMessageByRoom(roomId, textareaRef.current.value);
              textareaRef.current.value = "";
            }
          }}
        >
          <textarea
            onKeyDown={handleKeyDown}
            disabled={!currentRoom}
            ref={textareaRef}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            className=" disabled:bg-[#d4d4d4] bg-(--bg) w-[600px] rounded-[8px] px-4 py-3 scrollbar-none max-h-[100px] resize-none border border-black/30"
          ></textarea>
          <Button
            type="submit"
            disabled={!currentRoom}
            leftIcon={<SendIcon />}
            className="flex my-1"
          >
            Send
          </Button>
        </form>
      </footer>

      {openUsers && currentRoom && (
        <ModuleUsersRoom
          setOpen={setOpenUsers}
          room={currentRoom}
        ></ModuleUsersRoom>
      )}
    </div>
  );
};

