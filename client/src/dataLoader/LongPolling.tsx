import React from 'react';
import { Message } from '../types/message';

interface Props {
  onData: (data: Message[]) => void;
}

export const LongPollingLoader: React.FC<Props> = () => {
  return <h1 className="title">Long polling</h1>;
};
