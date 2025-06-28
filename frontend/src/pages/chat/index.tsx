import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { IGroup } from "@/types";
import Thread from "./components/Thread";
import ThreadItem from "./components/ThreadItem";
import { formatLastSeen } from "@/utils";
import User from "./components/User";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import Users from "../users";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SvgIcons } from "@/components/SvgIcons";
import { cn } from "@/lib/utils";
import Group from "../group";
import Settings from "@/components/Settings";
import moment from "moment";
import AnimatedBeeLogo from "@/components/AnimatedBeeLogo";
import { SocketLoadingScreen } from "@/components/ui/socket-loading";

export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
}

const Chat = () => {
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
  const isMobile = useIsMobile();
  const [open, setOpen] = useState<boolean>(true);

  // Redirect to auth page if not authenticated (but not while loading)
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/auth");
    }
  }, [currentUser, isLoading, router]);

  // Don't render anything if loading or not authenticated
  if (isLoading || !currentUser) {
    return null;
  }

  // Show loading screen if socket is not connected
  if (!isSocketConnected) {
    return <SocketLoadingScreen />;
  }

  return (
    <div className="relative overflow-hidden">
      <SidebarProvider
        open={open}
        defaultOpen={true}
        onOpenChange={(open) => setOpen(open)}
      >
        <Sidebar className="border-none border">
          <SidebarHeader className="py-0">
            <div className="flex flex-row h-[8vh] justify-between items-center">
              <div className="flex items-center gap-3 text-white">
                <AnimatedBeeLogo size="sm" />
                <text className="text-xl font-bold text-white">BuzzChat</text>
              </div>
              <div>
                {open && (
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
                          Show Users
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
          <SidebarContent>
            <SidebarGroup className="p-0">
              <SidebarGroupContent>
                <SidebarMenu className="m-0 gap-0">
                  {groups &&
                    groups?.map((group: IGroup) => {
                      return (
                        <ThreadItem
                          key={group?._id}
                          group={group}
                          newMessage={
                            groupMessages[group?._id]?.at(-1)?.createdAt &&
                            groupMessages[group?._id]?.at(-1)?.sender?._id !==
                              currentUser?._id
                              ? moment(
                                  groupMessages[group?._id]?.at(-1)?.createdAt
                                ).isAfter(
                                  moment(
                                    userGroupsStatus?.[group?._id] ??
                                      Date.now().toString()
                                  )
                                )
                              : false
                          }
                        />
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="bg-black shadow-[0_-8px_25px_-15px_rgba(255,255,255,0.25)] p-5 border-t rounded-t-xl border-gray-800">
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
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="relative flex flex-col h-full">
          <header className="flex h-[8vh] shrink-0 items-center gap-2 bg-secondary px-4">
            {!(open && !isMobile) && (
              <div className="flex flex-row justify-center items-center gap-3">
                <SidebarTrigger className="-ml-1 text-white" />
              </div>
            )}
            {activeGroup && (
              <Settings
                open={openGroupSettings}
                setOpen={setOpenGroupSettings}
                imageUrl={activeGroup?.imageUrl || ""}
                isGroup={!!activeGroup?.name}
                details={
                  !!activeGroup?.name
                    ? activeGroup
                    : groupMembers[activeGroup._id].find(
                        (member) => member._id !== currentUser?._id
                      ) || undefined
                }
                members={
                  !!activeGroup?.name
                    ? groupMembers[activeGroup._id] || []
                    : undefined
                }
                trigger={
                  <button>
                    <User
                      profileUrl={
                        activeGroup?.name
                          ? activeGroup?.imageUrl ?? ""
                          : groupMembers[activeGroup?._id].find(
                              (member) => member._id !== currentUser?._id
                            )?.profileUrl ?? ""
                      }
                      isGroup={!!activeGroup?.name}
                      name={
                        activeGroup?.name ??
                        `${
                          groupMembers[activeGroup._id].find(
                            (member) => member._id !== currentUser?._id
                          )?.firstName
                        } ${
                          groupMembers[activeGroup._id].find(
                            (member) => member._id !== currentUser?._id
                          )?.lastName
                        }` ??
                        "none"
                      }
                      lastMessage={null}
                      lastSeen={
                        !activeGroup?.name && memberStatus
                          ? memberStatus === "online"
                            ? memberStatus
                            : `last seen ${formatLastSeen(
                                new Date(memberStatus).toISOString()
                              )}`
                          : null
                      }
                      date={null}
                    />
                  </button>
                }
              />
            )}
          </header>
          <div className="h-[92vh] overflow-y-auto gap-4 flex flex-col">
            {activeGroup ? <Thread /> : <Users />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Chat;
