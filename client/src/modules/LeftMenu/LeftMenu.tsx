import {
  useEffect,
  useRef,
  useState,
  type FC,
  type HTMLAttributes,
} from "react";
import { cn } from "../../lib/cn";
import { Button } from "../../shared/Button/Button";
import {
  ArrowLeftIcon,
  HashIcon,
  MessagesSquareIcon,
  PlusIcon,
} from "lucide-react";
import { UserIcon } from "../../shared/UserIcon/UserIcon";
import { clientApi } from "../../api/clientApi";
import { useOnClickOutside } from "usehooks-ts";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/authContext";
import { useSideMenu } from "../../store/sideMenuContext";
import { useMedia } from "../../store/mediaContext";
import { useRoomMessage } from "../../store/roomMessageContext";

export const LeftMenu: FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  const { user } = useAuth();
  const { leftMenu, setLeftMenu } = useSideMenu();
  const { isDesktop } = useMedia();
  const [openCreateRoom, setOpenCreateRoom] = useState(false);
  const openCreateRoomRef = useRef<HTMLDivElement>(null);
  const focusCreateRoomRef = useRef<HTMLInputElement>(null);
  const { rooms } = useRoomMessage();

  useEffect(() => {
    setLeftMenu(isDesktop);
  }, [isDesktop, setLeftMenu]);

  useOnClickOutside(
    openCreateRoomRef as React.RefObject<HTMLDivElement>,
    () => {
      setOpenCreateRoom(false);
    }
  );

  useEffect(() => {
    if (openCreateRoom && focusCreateRoomRef && focusCreateRoomRef.current) {
      focusCreateRoomRef.current.focus();
    }
  }, [openCreateRoom]);

  return (
    <div
      {...props}
      className={cn(
        "  transition-[width] overflow-hidden w-full h-screen fixed z-10  lg:sticky  lg:w-[300px] lg:h-screen top-0",
        {
          "w-0": !leftMenu,
          "lg:w-0": !leftMenu,
          className,
        }
      )}
    >
      <aside className=" h-screen inset-0 lg:w-[300px]  bg-(--bg3) transition-[width] flex flex-col">
        <div className="flex px-2 py-4 md:px-4 md:py-8 shadow-[1px_0px_2px_2px_rgba(255,255,255,0.2)] items-center justify-center gap-4 relative">
          {!isDesktop && (
            <div className="absolute flex px-2 py-4 md:px-4 md:py-8 inset-0">
              <Button
                variant="link"
                onClick={() => {
                  setLeftMenu((prev) => !prev);
                }}
                className=" border-(--text-h2) text-(--text-h2) border rounded-[8px] shadow-[2px_2px_5px_#0008] h-full hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
              >
                <ArrowLeftIcon size={20}></ArrowLeftIcon>
              </Button>
            </div>
          )}

          <MessagesSquareIcon
            size={32}
            className="text-(--accent)"
          ></MessagesSquareIcon>
          <h2 className=" text-(--text-h2)">Chat Rooms</h2>
        </div>
        <div className=" relative flex px-6 py-4 justify-between items-center">
          <span className="font-[500] text-(--text2)">ROOMS</span>
          <div ref={openCreateRoomRef}>
            <Button
              onClick={() => {
                setOpenCreateRoom(!openCreateRoom);
              }}
              className=" flex"
              leftIcon={<PlusIcon></PlusIcon>}
            >
              Create Room
            </Button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const value = (
                  e.currentTarget.querySelector(
                    "#createNewRoom"
                  ) as HTMLInputElement
                ).value;
                if (user) {
                  clientApi.createRoom(value, user.id);
                }
                setOpenCreateRoom(false);
              }}
              className={cn(
                " flex flex-col gap-1 pointer-events-none px-1 py-1 rounded-[4px] shadow-[0px_0px_5px_5px_rgba(0,0,0,0.4)] bg-(--bg) text-(--text-h)  absolute bottom-0 z-80 opacity-0 transition-all",
                {
                  "pointer-events-auto opacity-100 translate-y-3/3":
                    openCreateRoom,
                }
              )}
            >
              <label className="text-[14px]" htmlFor="createNewRoom">
                Name:
              </label>
              <input
                ref={focusCreateRoomRef}
                id={"createNewRoom"}
                name="name"
                className=" text-(text-h) font-[500] bg-(--bg) min-w-[0px] max-w-[600px] w-full rounded-[8px] px-2 py-1 scrollbar-none max-h-[100px] resize-none border border-black/30"
                type="text"
              />
            </form>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 overflow-y-auto overflow-x-hidden scrollbar-thin gap-1">
          {rooms.map((room) => {
            return (
              <NavLink
                onClick={() => {
                  if (!isDesktop) {
                    setLeftMenu(false);
                  }
                }}
                to={"/" + room.id}
                key={room.id}
                className={({ isActive }) =>
                  cn(
                    "flex rounded-[10px] gap-2 p-4 hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] transition-[background-color]",
                    {
                      "border border-(--accent)": isActive,
                    }
                  )
                }
              >
                <HashIcon></HashIcon>
                <span className="text-(--text-h2) font-[500]">{room.name}</span>
              </NavLink>
            );
          })}
        </div>
        <div className="flex  justify-start mt-auto px-8 py-8 shadow-[1px_0px_2px_2px_rgba(255,255,255,0.2)] items-center justify-center gap-4 ">
          <UserIcon colorHuePercentage={user?.colorHuePercent || 60}></UserIcon>
          <span className="text-(--text-h2) text-[18px] font-[500]">
            {user ? user.username : "Username"}
          </span>
        </div>
      </aside>
    </div>
  );
};

