import moment from "moment";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SvgIcons } from "@/components/SvgIcons";
import { cn } from "@/lib/utils";
import { IGroup, IUser, IMessage } from "@/types";
import { CHAT_CONSTANTS } from "@/constants/chat";
import AnimatedBeeLogo from "@/components/AnimatedBeeLogo";
import Settings from "@/components/Settings";
import ThreadItem from "./ThreadItem";
import User from "./User";
import Group from "../../pages/group";

interface ChatSidebarProps {
  sidebarOpen: boolean;
  groups: IGroup[];
  groupMessages: Record<string, IMessage[]>;
  userGroupsStatus: Record<string, string> | null;
  currentUser: IUser | null;
  createGroup: boolean;
  setCreateGroup: (open: boolean) => void;
  openSettings: boolean;
  setOpenSettings: (open: boolean) => void;
  setActiveGroup: (group: IGroup | null) => void;
}

const ChatSidebar = ({
  sidebarOpen,
  groups,
  groupMessages,
  userGroupsStatus,
  currentUser,
  createGroup,
  setCreateGroup,
  openSettings,
  setOpenSettings,
  setActiveGroup,
}: ChatSidebarProps) => {
  const hasNewMessage = (group: IGroup) => {
    if (!groupMessages[group._id]?.length) return false;
    
    const lastMessage = groupMessages[group._id].at(-1);
    if (!lastMessage || lastMessage.sender?._id === currentUser?._id) return false;
    
    const lastMessageTime = moment(lastMessage.createdAt);
    const userLastSeen = moment(
      userGroupsStatus?.[group._id] ?? Date.now().toString()
    );
    
    return lastMessageTime.isAfter(userLastSeen);
  };

  const renderGroupThreads = () => {
    return groups?.map((group: IGroup) => (
      <ThreadItem
        key={group._id}
        group={group}
        newMessage={hasNewMessage(group)}
      />
    ));
  };

  const renderSidebarHeader = () => (
    <SidebarHeader className="py-0">
      <div className={`flex flex-row justify-between items-center h-16`}>
        <div className="flex items-center gap-3 text-white">
          <text className="text-xl font-bold text-white">
            {CHAT_CONSTANTS.APP_NAME}
          </text>
        </div>
        <div>
          {sidebarOpen && (
            <div className="flex flex-row justify-center items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "flex justify-center items-center w-7 h-7 text-white text-lg"
                    )}
                  >
                    <SvgIcons.PlusIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-none">
                  <DropdownMenuItem
                    className="hover:bg-secondary/50 items-center justify-center text-sm font-medium"
                    onSelect={() => setActiveGroup(null)}
                  >
                    {CHAT_CONSTANTS.LABELS.SHOW_USERS}
                  </DropdownMenuItem>
                  <Group open={createGroup} setOpen={setCreateGroup} />
                </DropdownMenuContent>
              </DropdownMenu>
              <SidebarTrigger className="-ml-1 text-white" />
            </div>
          )}
        </div>
      </div>
    </SidebarHeader>
  );

  const renderSidebarContent = () => (
    <SidebarContent>
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <SidebarMenu className="m-0 gap-0">
            {renderGroupThreads()}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );

  const renderSidebarFooter = () => (
    <SidebarFooter 
      className={`bg-black shadow-[${CHAT_CONSTANTS.STYLES.SIDEBAR_FOOTER_SHADOW}] ${CHAT_CONSTANTS.LAYOUT.SIDEBAR_FOOTER_PADDING} border-t ${CHAT_CONSTANTS.STYLES.BORDER_RADIUS} border-gray-800`}
    >
      <div className="flex justify-between items-center">
        {currentUser && (
          <User
            profileUrl={currentUser.profileUrl ?? ""}
            isGroup={false}
            name={`${currentUser.firstName} ${currentUser.lastName}`}
            lastMessage={null}
            lastSeen={null}
            date={null}
          />
        )}
        <Settings
          open={openSettings}
          setOpen={setOpenSettings}
          imageUrl={currentUser?.profileUrl || ""}
          isGroup={false}
          details={currentUser || undefined}
        />
      </div>
    </SidebarFooter>
  );

  return (
    <Sidebar className="border-none border">
      {renderSidebarHeader()}
      {renderSidebarContent()}
      {renderSidebarFooter()}
      <SidebarRail />
    </Sidebar>
  );
};

export default ChatSidebar; 