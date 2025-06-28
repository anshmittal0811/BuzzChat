import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { IGroup, IMessage, IUser, IAttachment } from "@/types";
import { chatService } from "@/services/chatService";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useAuth } from "@/contexts/auth-context";

interface IChatContext {
  // State
  groups: IGroup[];
  groupMessages: Record<string, IMessage[]>;
  groupMembers: Record<string, IUser[]>;
  activeGroup: IGroup | null;
  userMapRef: React.RefObject<Record<string, IUser>>;

  // Socket status
  memberStatus: string | null;
  groupStatus: Record<string, string> | null;
  userGroupsStatus: Record<string, string> | null;
  isSocketConnected: boolean;

  // Actions
  setGroups: React.Dispatch<React.SetStateAction<IGroup[]>>;
  setGroupMessages: React.Dispatch<
    React.SetStateAction<Record<string, IMessage[]>>
  >;
  setGroupMembers: React.Dispatch<
    React.SetStateAction<Record<string, IUser[]>>
  >;
  setActiveGroup: React.Dispatch<React.SetStateAction<IGroup | null>>;
  sendMessage: (message: string | null, attachment: IAttachment | null) => void;
  loadGroups: () => Promise<void>;
}

const ChatContext = createContext<IChatContext | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user: currentUser } = useAuth();
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [groupMessages, setGroupMessages] = useState<
    Record<string, IMessage[]>
  >({});
  const [groupMembers, setGroupMembers] = useState<Record<string, IUser[]>>({});
  const [activeGroup, setActiveGroup] = useState<IGroup | null>(null);
  const userMapRef = useRef<Record<string, IUser>>({});

  const { sendMessage, memberStatus, groupStatus, userGroupsStatus, isSocketConnected } =
    useChatSocket({
      activeGroup,
      lastMessage: groupMessages?.[activeGroup?._id ?? ""]?.at(-1) ?? null,
      groupMembers,
      setGroupMessages,
      userMapRef,
      onGroupCreated: (group, members) => {
        setGroups((prevGroups) => [...prevGroups, group]);
        setGroupMessages((prevMessages) => ({
          ...prevMessages,
          [group._id]: [],
        }));
        setGroupMembers((prevMembers) => ({
          ...prevMembers,
          [group._id]: members,
        }));
      },
    });

  const loadGroups = async () => {
    // Only load groups if user is authenticated
    if (!currentUser) {
      return;
    }

    try {
      const response = await chatService.fetchGroups();
      const data = response;

      const emptyGroups: IGroup[] = [];
      data.data.forEach(
        (
          group: IGroup & {
            members: IUser[];
            lastMessages: IMessage[];
          }
        ) =>
          emptyGroups.push({
            ...group,
            members: undefined,
            lastMessages: undefined,
          } as IGroup)
      );
      setGroups(emptyGroups);

      const emptyMessages: {
        [groupId: string]: IMessage[];
      } = {};
      data.data.forEach(
        (
          group: IGroup & {
            members: IUser[];
            lastMessages: IMessage[];
          }
        ) => (emptyMessages[group._id] = group?.lastMessages?.reverse())
      );
      setGroupMessages(emptyMessages);

      const emptyMembers: {
        [groupId: string]: IUser[];
      } = {};
      data.data.forEach(
        (
          group: IGroup & {
            members: IUser[];
            lastMessages: IMessage[];
          }
        ) => (emptyMembers[group._id] = group?.members)
      );
      setGroupMembers(emptyMembers);
      const flatUsers = Object.values(emptyMembers).flat();

      const map = flatUsers.reduce(
        (acc: Record<string, IUser>, user: IUser) => {
          acc[user._id] = user;
          return acc;
        },
        {}
      );
      userMapRef.current = map;
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  // Sort groups by latest message
  useEffect(() => {
    setGroups((prev) =>
      [...prev].sort((a, b) => {
        const aTime = groupMessages?.[a._id]?.at(-1)?.createdAt
          ? new Date(groupMessages[a._id]?.at(-1)?.createdAt ?? "").getTime()
          : new Date(a.updatedAt).getTime();
        const bTime = groupMessages?.[b._id]?.at(-1)?.createdAt
          ? new Date(groupMessages?.[b._id]?.at(-1)?.createdAt ?? "").getTime()
          : new Date(b.updatedAt).getTime();
        return bTime - aTime;
      })
    );
  }, [groupMessages]);

  // Load groups on mount only if user is authenticated
  useEffect(() => {
    if (currentUser) {
      loadGroups();
    }
  }, [currentUser]);

  const value: IChatContext = {
    groups,
    groupMessages,
    groupMembers,
    activeGroup,
    userMapRef,
    memberStatus,
    groupStatus: groupStatus ?? null,
    userGroupsStatus: userGroupsStatus ?? null,
    isSocketConnected,
    setGroups,
    setGroupMessages,
    setGroupMembers,
    setActiveGroup,
    sendMessage,
    loadGroups,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): IChatContext => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
