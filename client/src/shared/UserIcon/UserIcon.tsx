import type { FC, HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { User } from "lucide-react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  colorHuePercentage: number;
  size?: number;
}

export const UserIcon: FC<Props> = ({size = 32, colorHuePercentage, className, ...props }) => {
  return <div style={{ backgroundColor: `hsl(${colorHuePercentage * 3.6} 100% 50%)` }} className={cn('rounded-full flex items-center justify-center h-fit w-fit p-2' ,className)} {...props}>
    <User color="white" size={size}></User>
  </div>;
};

