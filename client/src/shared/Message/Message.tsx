import {
  useEffect,
  useState,
  type FunctionComponent,
  type HTMLAttributes,
} from "react";
import { cn } from "../../lib/cn";
import { UserIcon } from "../UserIcon/UserIcon";
import type { Message as MessageType, User } from "../../utils/types";
import { clientApi } from "../../api/clientApi";

interface Props extends HTMLAttributes<HTMLDivElement> {
  message: MessageType;
}

export const Message: FunctionComponent<Props> = ({
  message,
  className,
  ...props
}) => {
  const [userMessage, setUserMessage] = useState<Omit<
    User,
    "accessToken"
  > | null>(null);

  useEffect(() => {
    clientApi.getUser(message.userId).then((res) => {
      setUserMessage(res.data);
    });
  }, [message.userId]);

  return (
    <main className="flex-1">
      <div className={cn("flex gap-4", className)} {...props}>
        <UserIcon colorHuePercentage={userMessage?.colorHuePercent || 0} />
        <div className="flex gap-1 flex-col">
          <div className="flex gap-10">
            <span className=" font-[700] text-(--text-h)">{userMessage?.username || 'loading'}</span>
            <time>
              {Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }).format(new Date(message.time))}
            </time>
          </div>
          <p
            style={{
              backgroundColor: `hsl(${(userMessage?.colorHuePercent || 0) * 3.6} 100% 50% / 0.2)`,
            }}
            className={cn(
              " text-start rounded-[10px] px-4 py-2 whitespace-pre-line text-(--text-h) font-[400]"
            )}
          >
            {message.text}
          </p>
        </div>
      </div>
    </main>
  );
};

