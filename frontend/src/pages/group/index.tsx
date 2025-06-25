import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import { useToast } from "@/hooks/use-toast";
import { chatService } from "@/services/chatService";
import { userService } from "@/services/userService";
import { IGroup, IUser } from "@/types";
import { getInitials } from "@/utils";
import React, { useEffect, useState } from "react";

export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
}

const Group: React.FC<{
  open: boolean;
  setOpen: (value: boolean) => void;
}> = ({ open, setOpen }) => {
  const { user: currentUser } = useAuth();
  const {
    userMapRef,
    setGroups,
    setGroupMessages,
    setGroupMembers,
    setActiveGroup,
  } = useChat();
  const { toast } = useToast();
  const isDesktop = window.innerWidth >= 768;
  const [search, setSearch] = useState<string>("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string>("");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const response = await userService.fetchUsers(search, 1, 10);
      setUsers(response.data?.data);
      return () => clearTimeout(timeout);
    });
  }, [search]);

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const deselectAll = () => {
    setSelectedUsers([]);
  };

  const handleCreate = async () => {
    try {
      if (!selectedUsers || selectedUsers?.length === 0 || !currentUser?._id)
        return;
      const group = (
        await chatService.createGroup(groupName, [
          ...selectedUsers,
          currentUser._id,
        ])
      )?.data;

      const id = group?.groupId;

      const newGroup = {
        _id: id,
        name: groupName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as IGroup;

      setGroups((prevGroups) => [...prevGroups, newGroup]);

      setGroupMessages((prev) => ({
        ...prev,
        [id]: [],
      }));

      setGroupMembers((prev) => ({
        ...prev,
        [id]: [currentUser, ...users],
      }));

      users.map((user) => (userMapRef.current[user._id] = user));
      setActiveGroup(newGroup);
      setOpen(false);
      setGroupName("");
      setSearch("");
      setUsers([]);
      setSelectedUsers([]);
      toast({
        title: "Group Created Successfully!",
        description: "Your new group has been created and is ready to use",
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-none">
            Create Group
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px] text-white">
          <DialogHeader>
            <DialogTitle className="text-primary">Create Group</DialogTitle>
            <DialogDescription>
              Provide a group name and select users.
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-3"
          />

          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2"
          />

          <div className="flex gap-2 my-2">
            <Button variant="secondary" onClick={deselectAll} size="sm">
              Deselect All
            </Button>
          </div>

          <ScrollArea className="max-h-60 border rounded-md p-2">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-muted px-2 rounded-md"
                onClick={() => toggleUser(user._id)}
              >
                <Checkbox checked={selectedUsers.includes(user._id)} />
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.profileUrl || ""}
                    alt={user.firstName}
                  />
                  <AvatarFallback className="bg-primary text-secondary font-semibold">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  {user.firstName} {user.lastName}
                  <div className="text-muted-foreground text-xs">
                    {user.email}
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-2">
                No users found
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!groupName || selectedUsers.length === 0}
              onClick={handleCreate}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="border-none">
          Create Group
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-[425px] text-white">
        <DrawerHeader>
          <DrawerTitle className="text-primary">Create Group</DrawerTitle>
          <DrawerDescription>
            Provide a group name and select users.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-2 px-5">
          <Input
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-3"
          />

          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2"
          />

          <div className="flex gap-2 my-2">
            <Button variant="secondary" onClick={deselectAll} size="sm">
              Deselect All
            </Button>
          </div>

          <div className="max-h-60 border rounded-md p-2 overflow-auto">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-muted px-2 rounded-md"
                onClick={() => toggleUser(user._id)}
              >
                <Checkbox checked={selectedUsers.includes(user._id)} />
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.profileUrl || ""}
                    alt={user.firstName}
                  />
                  <AvatarFallback className="bg-primary">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  {user.firstName} {user.lastName}
                  <div className="text-muted-foreground text-xs">
                    {user.email}
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-2">
                No users found
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 my-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!groupName || selectedUsers.length === 0}
              onClick={handleCreate}
            >
              Create
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Group;
