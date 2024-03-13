// #region imports 
import * as R from 'react';
import './ChatPage.scss';

import { MessageForm } from '../../components/MessageForm/MessageForm';
import { MessageList } from '../../components/MessageList/MessageList';
import type { Message } from '../../types/Message.type';
import { DataLoader } from '../../components/DataLoader/DataLoader';
// #endregion

export function ChatPage() {
  const [messages, setMessages] = R.useState<Message[]>([]);

  return (
    <div className="box is-full-v-height">
      <div className="hero is-full-height">
        <DataLoader onData={setMessages} />

        <div className="container mx-0 mb-5 is-overflow-auto">
          <MessageList messages={messages} />
        </div>

        <MessageForm />
      </div>
    </div>
  )
}
