import * as R from 'react';

import { AppContext } from 'store/AppContext';
import { MessageAction } from 'types/Message.type';

type Props = {
  onMessage?: (text: string) => void
}

export const MessageForm: R.FC<Props> = ({
  onMessage = () => { },
}) => {
  const [text, setText] = R.useState('');
  const { messageSend } = R.useContext(AppContext);

  return (
    <form
      className="field is-horizontal"
      onSubmit={async (event) => {
        event.preventDefault();
        await messageSend(MessageAction.CREATE_MESSAGE, text);
        setText('');
      }}
    >
      <div className="field">
        <input
          type="text"
          className="input"
          placeholder="Enter a message"
          value={text}
          onChange={event => setText(event.target.value)}
        />
      </div>

      <div className="field">
        <button
          className="button is-primary"
          type="submit"
          disabled={!text}
        >
          Send
        </button>
      </div>
    </form>
  );
};
