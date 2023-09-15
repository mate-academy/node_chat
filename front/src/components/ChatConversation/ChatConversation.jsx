import React, { useContext } from "react";
import { AppContext } from "../../context/appContext";
import { format } from "date-fns";
import "./ChatConversation.scss";

const ChatConversation = ({ chatMessages = [], checkIsSender = () => {} }) => {
  //#region Get user and its setting function from context
  const { user } = useContext(AppContext);
  //#endregion

  //#region Render
  return (
    <React.Fragment>
      <div className="chat-conversation" id="messages">
        <ul className="list-unstyled">
          {chatMessages?.map((message, index) => (
            <li
              key={message?.id || index}
              className={checkIsSender(message) ? "right" : ""}
            >
              <div className="conversation-list">
                {chatMessages[index + 1] ? (
                  checkIsSender(chatMessages[index]) ===
                  checkIsSender(chatMessages[index + 1]) ? (
                    <div className="conversation-list__chat-avatar chat-avatar">
                      <div className="blank-div"></div>
                    </div>
                  ) : (
                    <div
                      className={"conversation-list__chat-avatar chat-avatar"}
                    >
                      {checkIsSender(message) ? (
                        user?.photoUrl ? (
                          <img
                            src={user?.photoUrl}
                            alt="Avatar"
                            className={"chat-avatar__image"}
                          />
                        ) : (
                          <div className={"chat-avatar__text"}>
                            <span>
                              {user?.fullName &&
                                user?.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )
                      ) : message?.author?.photoUrl ? (
                        <img
                          src={message?.author?.photoUrl}
                          alt="Avatar"
                          className={"chat-avatar__image"}
                        />
                      ) : (
                        <div className={"chat-avatar__text"}>
                          <span>
                            {message?.authorName &&
                              message?.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className={"conversation-list__chat-avatar chat-avatar"}>
                    {checkIsSender(message) ? (
                      user?.photoUrl ? (
                        <img
                          src={user?.photoUrl}
                          alt="Avatar"
                          className={"chat-avatar"}
                        />
                      ) : (
                        <div className={"chat-avatar__text"}>
                          <span>{user?.fullName.charAt(0).toUpperCase()}</span>
                        </div>
                      )
                    ) : message?.author?.photoUrl ? (
                      <img
                        src={message?.author?.photoUrl}
                        alt="Avatar"
                        className={"chat-avatar__image"}
                      />
                    ) : (
                      <div className={"chat-avatar__text"}>
                        <span>
                          {message?.authorName &&
                            message?.authorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className={"user-chat-content"}>
                  <div className={"ctext-wrap"}>
                    <div className={"ctext-wrap-content"}>
                      {message?.text && (
                        <p className="chat-conversation__message">
                          {message?.text}
                        </p>
                      )}

                      {
                        <p className="chat-time">
                          {message?.createdAt && (
                            <span>
                              {format(
                                new Date(message?.createdAt),
                                "dd.MM.yy HH:mm"
                              )}
                            </span>
                          )}
                        </p>
                      }
                    </div>
                  </div>

                  {chatMessages[index + 1] ? (
                    checkIsSender(chatMessages[index]) ===
                    checkIsSender(chatMessages[index + 1]) ? null : (
                      <div className="conversation-name">
                        {checkIsSender(message)
                          ? user?.fullName
                          : message?.authorName}
                      </div>
                    )
                  ) : (
                    <div className="conversation-name">
                      {checkIsSender(message)
                        ? user?.fullName
                        : message?.authorName}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
  //#endregion
};

export default ChatConversation;
