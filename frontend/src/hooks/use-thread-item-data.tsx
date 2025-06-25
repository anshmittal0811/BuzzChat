import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import { IChatThreadItemProps } from "@/types";

/**
 * Custom hook to extract thread item business logic
 * Separates data processing from UI rendering for better maintainability
 * 
 * @param group - The group/thread data from IChatThreadItemProps
 * @returns Computed thread display data including name, profile, last message, etc.
 */
export const useThreadItemData = (group: IChatThreadItemProps['group']) => {
  const { user } = useAuth();
  const { groupMembers, groupMessages } = useChat();

  return useMemo(() => {
    const members = groupMembers[group?._id] || [];
    const messages = groupMessages[group?._id] || [];
    const lastMessage = messages.at(-1);

    // Find the other user in the group (for direct messages)
    const otherUser = members.find((member) => member._id !== user?._id);

    // Determine if this is a group chat or direct message
    const isGroupChat = !!group?.name;

    // Calculate display name
    const displayName = isGroupChat 
      ? (group.name || "Group Chat")
      : otherUser 
        ? `${otherUser.firstName} ${otherUser.lastName}` 
        : "Unknown User";

    // Calculate profile URL
    const profileUrl = isGroupChat 
      ? (group.imageUrl || "") 
      : (otherUser?.profileUrl || "");

    // Calculate last message content
    const lastMessageContent = lastMessage?.content || 
                              lastMessage?.attachment?.name || 
                              "";

    // Calculate last message date
    const lastMessageDate = lastMessage?.createdAt || group?.createdAt;

    return {
      displayName,
      profileUrl,
      lastMessageContent,
      lastMessageDate,
      isGroupChat,
      hasValidData: !!group?._id && displayName !== "Unknown User"
    };
  }, [group, user, groupMembers, groupMessages]);
}; 