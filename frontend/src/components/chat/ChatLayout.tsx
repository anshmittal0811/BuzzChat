import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { IGroup, IUser, IMessage } from "@/types";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatContent from "./ChatContent";

interface ChatLayoutProps {
  // Sidebar props
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  groups: IGroup[];
  groupMessages: Record<string, IMessage[]>;
  userGroupsStatus: Record<string, string> | null;
  currentUser: IUser | null;
  createGroup: boolean;
  setCreateGroup: (open: boolean) => void;
  openSettings: boolean;
  setOpenSettings: (open: boolean) => void;
  setActiveGroup: (group: IGroup | null) => void;
  
  // Header props
  activeGroup: IGroup | null;
  groupMembers: Record<string, IUser[]>;
  memberStatus: string | null;
  openGroupSettings: boolean;
  setOpenGroupSettings: (open: boolean) => void;
}

const ChatLayout = ({
  sidebarOpen,
  setSidebarOpen,
  groups,
  groupMessages,
  userGroupsStatus,
  currentUser,
  createGroup,
  setCreateGroup,
  openSettings,
  setOpenSettings,
  setActiveGroup,
  activeGroup,
  groupMembers,
  memberStatus,
  openGroupSettings,
  setOpenGroupSettings,
}: ChatLayoutProps) => {
  return (
    <div className="relative overflow-hidden">
      <SidebarProvider
        open={sidebarOpen}
        defaultOpen={true}
        onOpenChange={setSidebarOpen}
      >
        <ChatSidebar
          sidebarOpen={sidebarOpen}
          groups={groups}
          groupMessages={groupMessages}
          userGroupsStatus={userGroupsStatus}
          currentUser={currentUser}
          createGroup={createGroup}
          setCreateGroup={setCreateGroup}
          openSettings={openSettings}
          setOpenSettings={setOpenSettings}
          setActiveGroup={setActiveGroup}
        />
        
        <SidebarInset className="relative flex flex-col h-full">
          <ChatHeader
            sidebarOpen={sidebarOpen}
            activeGroup={activeGroup}
            currentUser={currentUser}
            groupMembers={groupMembers}
            memberStatus={memberStatus}
            openGroupSettings={openGroupSettings}
            setOpenGroupSettings={setOpenGroupSettings}
          />
          
          <ChatContent activeGroup={activeGroup} />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default ChatLayout; 