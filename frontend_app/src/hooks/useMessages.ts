import { useEffect } from "react";
import { useRooms } from "../context/RoomsContext";
import { useMessages } from "../context/MessagesContext";

export const useMessagesHook = () => {
  const { currentRoomId } = useRooms();
  const { messagesByRoom, fetchHistory } = useMessages();

  useEffect(() => {
    if (currentRoomId && !messagesByRoom[currentRoomId]) {
      fetchHistory(currentRoomId);
    }
  }, [currentRoomId]);

  return { messagesByRoom };
};
