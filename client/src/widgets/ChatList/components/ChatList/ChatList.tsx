import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../shared/hooks/reduxHooks";
import { Container, Stack } from 'react-bootstrap';
import { Chat } from '../../../../entities/Chat';
import { PotentialChat } from '../../../../entities/Chat';
import { getPotentialChats } from "../../helpers/getPotentialChats";
import { PotentialChats } from "../PotentialChats/PotentialChats";
import { setCurrentChat } from "../../../../entities/Chat";
import * as actionChat from '../../../../entities/Chat';
import { ChatBox } from "../ChatBox/ChatBox";

export const ChatList = React.memo(() => {
  const dispatch = useAppDispatch();
  const { chats, error } = useAppSelector(state => state.chats);
  const { messages } = useAppSelector(state => state.messages)
  const { user } = useAppSelector(state => state.user);
  const [potentialChats, setPotentialChats] = useState<PotentialChat[]>([]);
  const userId = user ? user.id : null;

  const fetchChats = (id: number) => {
    dispatch(actionChat.getChats(id))
  }

  useEffect(() => {
    if (!user) return;

    dispatch(actionChat.getChats(user.id));
  }, [messages])

  useEffect(() => {
    if (!userId) return;

    fetchChats(userId)
  }, []);

  useEffect(() => {
    getPotentialChats(user, chats)
      .then(res => setPotentialChats(res))
      .catch(err => console.log(err));
  }, [chats]);

  return (
    <Container id='chat-list'>
      <PotentialChats
        chats={potentialChats}
        userId={userId}
        updateChats={fetchChats}
      />

      {error && <p>Something went wrong...</p>}

      {!chats.length ? null : (
        <Stack direction='horizontal' gap={4} className='align-items-start'>
          <Stack className='messages-box flex-grow-0 pe-3' gap={3}>
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => dispatch(setCurrentChat(chat))}>
                <Chat chat={chat} user={user} />
              </div>
            ))}
          </Stack>

          <ChatBox />
        </Stack>
      )}
    </Container>
  )
})
