import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { SvgIcons } from "@/components/SvgIcons";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils";
import { IUser, IGroup } from "@/types";
import { userService } from "@/services/userService";
import { uploadFileInChunks } from "@/utils/uploadFileInChunks";
import { useAuth } from "@/contexts/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiResponse } from "@/lib/api";
import { chatService } from "@/services/chatService";
import { useChat } from "@/contexts/chat-context";

interface ISettingsProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  trigger?: React.ReactNode;
  imageUrl?: string | null;
  isGroup?: boolean;
  details?: IUser | IGroup;
  members?: IUser[];
}

const Settings: React.FC<ISettingsProps> = ({
  open,
  setOpen,
  trigger,
  imageUrl = null,
  isGroup = false,
  details = {},
  members = [],
}) => {
  const isMobile = useIsMobile();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setGroups, setActiveGroup } = useChat();
  // Form state
  const [groupName, setGroupName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [profileUrl, setProfileUrl] = useState<string>("");

  // Initialize form fields when component opens
  useEffect(() => {
    if (open && details) {
      if (isGroup) {
        setGroupName((details as IGroup).name || "");
        setProfileUrl((details as IGroup).imageUrl || "");
      } else {
        setFirstName((details as IUser).firstName || "");
        setLastName((details as IUser).lastName || "");
        setProfileUrl((details as IUser).profileUrl || "");
      }
    }
  }, [open, details, isGroup]);

  const handleSave = useCallback(async () => {
    if (!isGroup) {
      const response = (await userService.updateProfileUrl(
        profileUrl
      )) as unknown as ApiResponse<IUser>;
      if (response.statusCode === 200) {
        updateUser({ ...user, profileUrl } as IUser);
      }
    } else {
      const response = (await chatService.updateGroup(
        (details as IGroup)._id,
        groupName,
        profileUrl
      )) as unknown as ApiResponse<IGroup>;
      if (response.statusCode === 200) {
        setOpen(false);
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === (details as IGroup)._id ? response.data : group
          )
        );
        setActiveGroup((prev) =>
          prev?._id === (details as IGroup)._id
            ? { ...response.data, imageUrl: profileUrl }
            : prev
        );
      }
    }
    setOpen(false);
  }, [
    profileUrl,
    isGroup,
    user,
    updateUser,
    setOpen,
    details,
    groupName,
    setGroups,
    setActiveGroup,
  ]);

  const handleCancel = useCallback(() => {
    // Reset form fields
    if (isGroup && details) {
      setGroupName((details as IGroup).name || "");
    } else if (details) {
      setFirstName((details as IUser).firstName || "");
      setLastName((details as IUser).lastName || "");
    }
    setOpen(false);
  }, [isGroup, details, setGroupName, setFirstName, setLastName, setOpen]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth";
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          console.error("Please select an image file");
          return;
        }

        try {
          const result = await uploadFileInChunks(file, () => {});
          if (result) {
            setProfileUrl(result?.url);
          }
        } catch (error) {
          console.error("Upload failed", error);
        }
      }
    },
    [setProfileUrl]
  );

  const handleUpdateProfileUrl = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const SettingsContent = useMemo(
    () => (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileUrl || imageUrl || ""} alt="Profile" />
              <AvatarFallback className="bg-primary text-secondary text-3xl font-bold">
                {details ? (
                  isGroup ? (
                    <SvgIcons.GroupIcon size={50} />
                  ) : (
                    getInitials(details as IUser)
                  )
                ) : (
                  "?"
                )}
              </AvatarFallback>
            </Avatar>
            {(user?._id === (details as IUser)?._id || isGroup) && (
              <>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-2"
                  onClick={handleUpdateProfileUrl}
                >
                  <SvgIcons.EditIcon />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {isGroup ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full bg-muted text-secondary-foreground"
                />
              </div>

              {/* Group Members Section */}
              {members && members.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Members ({members.length})
                  </label>
                  <ScrollArea className="h-48 border rounded-md p-3">
                    <div className="space-y-3">
                      {members.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={member.profileUrl || ""}
                              alt={`${member.firstName} ${member.lastName}`}
                            />
                            <AvatarFallback className="bg-primary text-secondary font-semibold">
                              {getInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-secondary-foreground font-medium truncate">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.email}
                            </p>
                          </div>
                          {member._id === user?._id && (
                            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={firstName}
                  readOnly
                  disabled
                  className="w-full bg-muted text-secondary-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={lastName}
                  readOnly
                  disabled
                  className="w-full bg-muted text-secondary-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(user?._id === (details as IUser)?._id || isGroup) && (
          <div className="flex justify-end gap-2 pt-4">
            {user?._id === (details as IUser)?._id && (
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            )}
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isGroup
                  ? (details as IGroup)?.name === groupName &&
                    imageUrl === profileUrl
                  : (details as IUser)?.firstName === firstName &&
                    (details as IUser)?.lastName === lastName &&
                    imageUrl === profileUrl
              }
            >
              Save
            </Button>
          </div>
        )}
      </div>
    ),
    [
      profileUrl,
      imageUrl,
      details,
      isGroup,
      user,
      groupName,
      firstName,
      lastName,
      members,
      handleSave,
      handleCancel,
      handleLogout,
      handleFileChange,
      handleUpdateProfileUrl,
    ]
  );

  const defaultTrigger = useMemo(
    () => (
      <Button
        variant="outline"
        size="icon"
        className={cn("flex justify-center items-center w-8 h-8")}
      >
        <SvgIcons.SettingsIcon />
      </Button>
    ),
    []
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger || defaultTrigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-primary">
              {isGroup ? "Group Settings" : "Profile"}
            </DrawerTitle>
            <DrawerDescription>
              {isGroup
                ? "Manage your group settings"
                : user?._id === (details as IUser)?._id
                ? "Manage your profile settings"
                : ""}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{SettingsContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-white">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {isGroup ? "Group Settings" : "Profile"}
          </DialogTitle>
          <DialogDescription>
            {isGroup
              ? "Manage your group settings"
              : user?._id === (details as IUser)?._id
              ? "Manage your profile settings"
              : ""}
          </DialogDescription>
        </DialogHeader>
        {SettingsContent}
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
