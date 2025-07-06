import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { CHAT_CONSTANTS } from "@/constants/chat";
import { IGroup, IUser } from "@/types";
import { formatLastSeen } from "@/utils";
import Settings from "@/components/Settings";
import User from "./User";

interface ChatHeaderProps {
  sidebarOpen: boolean;
  activeGroup: IGroup | null;
  currentUser: IUser | null;
  groupMembers: Record<string, IUser[]>;
  memberStatus: string | null;
  openGroupSettings: boolean;
  setOpenGroupSettings: (open: boolean) => void;
}

const ChatHeader = ({
  sidebarOpen,
  activeGroup,
  currentUser,
  groupMembers,
  memberStatus,
  openGroupSettings,
  setOpenGroupSettings,
}: ChatHeaderProps) => {
  const isMobile = useIsMobile();
  const shouldShowSidebarTrigger = !(sidebarOpen && !isMobile);

  const getActiveGroupMember = () => {
    if (!activeGroup || !groupMembers[activeGroup._id]) return undefined;
    return groupMembers[activeGroup._id].find(
      (member) => member._id !== currentUser?._id
    );
  };

  const getActiveGroupName = () => {
    if (!activeGroup) return CHAT_CONSTANTS.LABELS.NONE;
    
    if (activeGroup.name) {
      return activeGroup.name;
    }
    
    const member = getActiveGroupMember();
    return member ? `${member.firstName} ${member.lastName}` : CHAT_CONSTANTS.LABELS.NONE;
  };

  const getActiveGroupImageUrl = () => {
    if (!activeGroup) return "";
    
    if (activeGroup.name) {
      return activeGroup.imageUrl ?? "";
    }
    
    const member = getActiveGroupMember();
    return member?.profileUrl ?? "";
  };

  const getActiveGroupLastSeen = () => {
    if (!activeGroup || activeGroup.name || !memberStatus) return null;
    
    if (memberStatus === CHAT_CONSTANTS.LABELS.ONLINE) {
      return memberStatus;
    }
    
    return `${CHAT_CONSTANTS.LABELS.LAST_SEEN} ${formatLastSeen(
      new Date(memberStatus).toISOString()
    )}`;
  };

  const getSettingsDetails = () => {
    if (!activeGroup) return undefined;
    
    if (activeGroup.name) {
      return activeGroup;
    }
    
    return getActiveGroupMember();
  };

  const getSettingsMembers = () => {
    if (!activeGroup || !activeGroup.name) return undefined;
    return groupMembers[activeGroup._id] || [];
  };

  return (
    <header className={`flex shrink-0 items-center gap-2 bg-secondary px-4 h-[${CHAT_CONSTANTS.LAYOUT.HEADER_HEIGHT}]`}>
      {shouldShowSidebarTrigger && (
        <div className="flex flex-row justify-center items-center gap-3">
          <SidebarTrigger className="-ml-1 text-white" />
        </div>
      )}
      
      {activeGroup && (
        <Settings
          open={openGroupSettings}
          setOpen={setOpenGroupSettings}
          imageUrl={getActiveGroupImageUrl()}
          isGroup={!!activeGroup.name}
          details={getSettingsDetails()}
          members={getSettingsMembers()}
          trigger={
            <button>
              <User
                profileUrl={getActiveGroupImageUrl()}
                isGroup={!!activeGroup.name}
                name={getActiveGroupName()}
                lastMessage={null}
                lastSeen={getActiveGroupLastSeen()}
                date={null}
              />
            </button>
          }
        />
      )}
    </header>
  );
};

export default ChatHeader; 