import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import { CHAT_CONSTANTS } from "@/constants/chat";

export const useChatPage = () => {
  const router = useRouter();
  const { user: currentUser, isLoading } = useAuth();
  const {
    groups,
    groupMessages,
    groupMembers,
    activeGroup,
    memberStatus,
    userGroupsStatus,
    setActiveGroup,
    isSocketConnected,
  } = useChat();

  const [createGroup, setCreateGroup] = useState<boolean>(false);
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const [openGroupSettings, setOpenGroupSettings] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Handle authentication redirect
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push(CHAT_CONSTANTS.ROUTES.AUTH);
    }
  }, [currentUser, isLoading, router]);

  // Determine if we should show loading state
  const shouldShowLoading = isLoading || !currentUser;
  const shouldShowSocketLoading = !isLoading && currentUser && !isSocketConnected;

  return {
    // User & Auth
    currentUser,
    isLoading,
    shouldShowLoading,
    shouldShowSocketLoading,
    
    // Chat State
    groups,
    groupMessages,
    groupMembers,
    activeGroup,
    memberStatus,
    userGroupsStatus,
    setActiveGroup,
    isSocketConnected,
    
    // UI State
    createGroup,
    setCreateGroup,
    openSettings,
    setOpenSettings,
    openGroupSettings,
    setOpenGroupSettings,
    sidebarOpen,
    setSidebarOpen,
  };
}; 