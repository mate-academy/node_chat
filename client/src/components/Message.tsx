import React from 'react'
import type { Message  as MessageType } from '../types/Message'

type Props = {
  message: MessageType
  isAuthor?: boolean
}
const Message = ({message, isAuthor=false}:Props) => {

  return (
    <div className={`message${isAuthor ? ' _right': ''}`}>
      <h2 className='message__name'>{message.author}</h2>
      <p className='message__text'>{message.text}</p>
      <p className='message__date'>{message.date}</p>
    </div>
  )
}

export default Message
