import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { IChatThreadItemProps } from "@/types";
import { formatDate } from "@/utils";
import User from "./User";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { useThreadItemData } from "@/hooks/use-thread-item-data";

/**
 * ThreadItem Component
 * 
 * Renders a single thread item in the chat sidebar.
 * Handles both group chats and direct messages with proper fallbacks.
 * 
 * @param group - The group/thread data
 * @param newMessage - Whether there's a new message indicator
 */
const ThreadItem: React.FC<IChatThreadItemProps> = ({ group, newMessage }) => {
  const { activeGroup, setActiveGroup } = useChat();
  
  const {
    displayName,
    profileUrl,
    lastMessageContent,
    lastMessageDate,
    isGroupChat,
    hasValidData
  } = useThreadItemData(group);

  // Handle thread selection
  const handleThreadSelect = () => {
    if (group && hasValidData) {
      setActiveGroup(group);
    }
  };

  // Generate CSS classes for active state
  const getButtonClasses = () => {
    const baseClasses = "p-5 h-auto rounded-none hover:bg-accent";
    const activeClasses = activeGroup?._id === group?._id 
      ? "border-r-2 border-r-primary" 
      : "";
    
    return `${baseClasses} ${activeClasses}`;
  };

  // Early return if invalid data
  if (!hasValidData) {
    return null;
  }

  return (
    <SidebarMenuItem key={group._id}>
      <SidebarMenuButton asChild>
        <Button
          onClick={handleThreadSelect}
          variant="ghost"
          className={getButtonClasses()}
          aria-label={`Open chat with ${displayName}`}
        >
          <User
            profileUrl={profileUrl}
            isGroup={isGroupChat}
            name={displayName}
            lastMessage={lastMessageContent}
            lastSeen={null}
                         date={formatDate(lastMessageDate) || null}
            newMessage={newMessage}
          />
        </Button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default ThreadItem;
