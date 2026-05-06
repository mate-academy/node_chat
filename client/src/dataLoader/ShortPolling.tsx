import React from 'react';
import { Message } from '../types/message';

interface Props {
  onData: (data: Message[]) => void;
}

export const ShortPollingLoader: React.FC<Props> = () => {
  return <h1 className="title">Short polling</h1>;
}
