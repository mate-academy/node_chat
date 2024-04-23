import { PotentialChat } from "../../../../entities/Chat/types/chatTypes";
import { create as createChat } from '../../../../entities/Chat';
import { useState } from "react";
import { useAppSelector } from "../../../../shared/hooks/reduxHooks";
import classNames from "classnames";

type Props = {
  chats: PotentialChat[];
  userId: number | null;
  updateChats: Function;
}

export const PotentialChats: React.FC<Props> = ({
  chats,
  userId,
  updateChats,
}) => {
  const { usersOnline } = useAppSelector(state => state.socket);
  const [loaging, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleClick = (firstId: number) => {
    if (!userId) return;

    setLoading(true);
    setLoadingId(firstId);
    createChat({ firstId, secondId: userId })
      .then(() => updateChats(userId))
      .catch(err => setError(err.message))
      .finally(() => {
        setLoadingId(null);
        setLoading(false)
      });
  };

  return (
    <div className="all-users">
      {chats && chats.map(el => (
        <div
          className="single-user"
          key={el.id}
          onClick={() => handleClick(el.id)}
        >
          {loaging && el.id === loadingId ? '...' : el.name}
          <span className={classNames({
            'user-online': usersOnline.some(user => user.userId === el.id)
          })} />
        </div>
      ))}

      {error && (<p>{error}</p>)}
    </div>
  );
}