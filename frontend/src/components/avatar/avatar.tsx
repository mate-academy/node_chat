import { FC } from "react";
import "./avatar.scss";

type AvatarProps = {
  name: string;
  backgroundColor: string;
};

export const Avatar: FC<AvatarProps> = ({ name, backgroundColor }) => {
  return (
    <div
      className="avatar"
      style={{
        backgroundColor,
        color: "white",
      }}
    >
      {name.at(0)}
    </div>
  );
};
