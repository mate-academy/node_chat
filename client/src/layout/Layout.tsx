import { useWebSocket } from "../context/hooks";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const socket = useWebSocket();
  const username = socket?.user.name;

  return (
    <div className="columns is-centered">
      <div className="column is-8">
        <div className="box">
          <div className="level">
            <div className="level-left">
              <div>
                <p className="heading">Logged in as</p>
                <p className="title is-5">{username}</p>
              </div>
            </div>

            <div className="level-right">
              <span
                className={`tag ${
                  socket ? 'is-success' : 'is-warning'
                }`}
              >
                {socket ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>

          <hr />

          {children}
        </div>
      </div>
    </div>
  );
};
