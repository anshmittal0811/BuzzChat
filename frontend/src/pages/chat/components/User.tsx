import { SvgIcons } from "@/components/SvgIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IChatUserProps } from "@/types";
import { getInitials } from "@/utils";

const User = ({
  profileUrl,
  isGroup,
  name,
  lastMessage,
  lastSeen,
  date,
  newMessage = false,
}: IChatUserProps) => {
  return (
    <div className="flex gap-3 items-center w-full">
      {newMessage && <div className="w-2 h-2 bg-ring rounded-full" />}
      <Avatar>
        <AvatarImage src={profileUrl} />
        <AvatarFallback className="bg-primary text-black font-bold">
          {!isGroup ? (
            getInitials({
              firstName: name?.split(" ")?.[0],
              lastName: name?.split(" ")?.[1],
              _id: "",
              email: "",
              profileUrl: "",
            })
          ) : (
            <SvgIcons.GroupIcon size={20} />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col w-[85%]">
        <div className="flex flex-row justify-between">
          <text className="font-bold text-white">{name}</text>
          {date && (
            <text className={`${!newMessage ? "text-white" : "text-ring"}`}>
              {date}
            </text>
          )}
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center overflow-hidden">
            {(lastMessage || lastSeen) && (
              <p
                className={`truncate ${
                  newMessage ? "font-bold text-ring" : "font-medium"
                } text-primary`}
              >
                {lastMessage || lastSeen}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
