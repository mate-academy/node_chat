import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FC,
  type SetStateAction,
} from "react";
import type { Room, User } from "../../utils/types";
import { useOnClickOutside } from "usehooks-ts";
import { clientApi } from "../../api/clientApi";
import { UserIcon } from "../../shared/UserIcon/UserIcon";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "../../shared/Button/Button";
import { useAuth } from "../../store/authContext";
import { useRoomMessage } from "../../store/roomMessageContext";

interface ModuleUsersRoomProps {
  room: Room;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const ModuleUsersRoom: FC<ModuleUsersRoomProps> = ({
  setOpen,
  room,
}) => {
  const [openAddMember, setOpenAddMember] = useState(false);
  const moduleRef = useRef<HTMLDivElement>(null);
  const addMemberOutsideRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { currentRoom } = useRoomMessage();
  const [members, setMembers] = useState<Omit<User, "accessToken">[] | null>(
    null
  );

  useOnClickOutside(moduleRef as React.RefObject<HTMLDivElement>, () => {
    setOpen(false);
  });

  useOnClickOutside(
    addMemberOutsideRef as React.RefObject<HTMLDivElement>,
    () => {
      setOpenAddMember(false);
    }
  );

  useEffect(() => {
    clientApi.getMembersByRoom(room.id).then((res) => {
      setMembers(res.data);
    });
  }, [room.id]);

  const [allUsers, setAllUsers] = useState<Omit<User, "accessToken">[] | null>(
    null
  );

  const getUsersCanAddRoom = useMemo(() => {
    return allUsers?.filter((item) => {
      return !members?.some((mem) => mem.id === item.id);
    });
  }, [allUsers, members]);

  const handleGetAllUsers = useCallback(() => {
    if (currentRoom?.ownerId === user?.id) {
      clientApi.getAllUser().then((res) => setAllUsers(res.data));
    }
  }, [currentRoom?.ownerId, user?.id]);

  useEffect(() => {
    if (currentRoom?.ownerId === user?.id) {
      clientApi.getAllUser().then((res) => setAllUsers(res.data));
    }
  }, [user?.id, members, currentRoom]);

  return (
    <div className=" min-w-[320px] z-40 flex justify-center items-center fixed inset-0 bg-[rgba(0,0,0,0.5)]">
      <div
        ref={moduleRef}
        className=" rounded-2xl p-4 bg-(--bg) w-2/6  min-w-80 max-h-1/2"
      >
        <h3>
          {"ABOUT THIS ROOM: "} <span className=" font-[800]">{room.name}</span>
        </h3>
        <h4 className="mt-2">{`MEMBERS: (${room.usersId.length + 1})`}</h4>
        {currentRoom?.ownerId === user?.id && (
          <div ref={addMemberOutsideRef} className=" relative w-fit">
            <Button
              onClick={() => {
                handleGetAllUsers();
                setOpenAddMember(true);
              }}
              className="flex w-fit"
              leftIcon={<PlusIcon></PlusIcon>}
            >
              Add member
            </Button>
            {openAddMember && (
              <div className=" h-max-400px bg-(--bg) p-4 rounded-2xl shadow-[0px_0px_5px_5px_rgba(0,0,0,0.5)] absolute flex flex-col gap-2">
                {getUsersCanAddRoom && getUsersCanAddRoom.length === 0 ? (
                  <div>Not found users</div>
                ) : (
                  getUsersCanAddRoom &&
                  getUsersCanAddRoom.map((anotherUser) => (
                    <div className="flex gap-2" key={anotherUser.id}>
                      <Button
                        onClick={() => {
                          clientApi.addMemberRoom(
                            currentRoom?.id || '',
                            anotherUser.id
                          );
                        }}
                        className="flex px-2"
                        leftIcon={
                          <UserIcon
                            size={18}
                            colorHuePercentage={anotherUser.colorHuePercent}
                          ></UserIcon>
                        }
                        variant="outline"
                      >
                        {anotherUser.username}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2 mt-5">
          {members &&
            members.map((member) => {
              return (
                <div key={member.id} className="flex  items-center gap-4  border p-1 rounded-2xl">
                  <UserIcon
                    colorHuePercentage={member.colorHuePercent}
                  ></UserIcon>
                  <span className="font-[800]">{member.username}</span>
                  {member.id !== user?.id ? (
                    currentRoom?.ownerId === user?.id && (
                      <div className="flex-1 flex">
                        <Button
                          onClick={() => {
                            clientApi.deleteMemberRoom(
                              currentRoom?.id || '',
                              member.id
                            );
                          }}
                          variant="ghost"
                          className="ml-auto"
                        >
                          <XIcon></XIcon>
                        </Button>
                      </div>
                    )
                  ) : (
                    <span>Owner</span>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

