import { IGroup } from "@/types";
import Thread from "@/components/chat/Thread";
import Users from "@/pages/users";

interface ChatContentProps {
  activeGroup: IGroup | null;
}

const ChatContent = ({ activeGroup }: ChatContentProps) => {
  return (
    <div className={`overflow-y-auto gap-4 flex flex-col h-full`}>
      {activeGroup ? <Thread /> : <Users />}
    </div>
  );
};

export default ChatContent; 