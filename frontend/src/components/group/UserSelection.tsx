/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { GROUP_CONSTANTS } from "@/constants/group";
import { UserSelectionProps } from "@/types/group";
import { getInitials } from "@/utils";

export const UserSelection: React.FC<UserSelectionProps> = ({
  users,
  selectedUsers,
  onToggleUser,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <ScrollArea className={GROUP_CONSTANTS.UI.SCROLL_AREA_HEIGHT}>
        <div className="border rounded-md p-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-2 px-2">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className={GROUP_CONSTANTS.UI.SCROLL_AREA_HEIGHT}>
      <div className="border rounded-md p-2">
        {users.map((user) => (
          <UserSelectionItem
            key={user._id}
            user={user}
            isSelected={selectedUsers.includes(user._id)}
            onToggle={onToggleUser}
          />
        ))}
        {users.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-2">
            {GROUP_CONSTANTS.MESSAGES.NO_USERS_FOUND}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

interface UserSelectionItemProps {
  user: any; // Using any to match the existing IUser type
  isSelected: boolean;
  onToggle: (userId: string) => void;
}

const UserSelectionItem: React.FC<UserSelectionItemProps> = ({
  user,
  isSelected,
  onToggle,
}) => {
  const handleClick = () => {
    onToggle(user._id);
  };

  return (
    <div
      className="flex items-center gap-3 py-2 cursor-pointer hover:bg-muted px-2 rounded-md transition-colors"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Checkbox
        checked={isSelected}
        onChange={handleClick}
        aria-label={`Select ${user.firstName} ${user.lastName}`}
      />
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={user.profileUrl || ""}
          alt={`${user.firstName} ${user.lastName}`}
        />
        <AvatarFallback className="bg-primary text-secondary font-semibold">
          {getInitials(user)}
        </AvatarFallback>
      </Avatar>
      <div className="text-sm flex-1">
        <div className="font-medium">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-muted-foreground text-xs">{user.email}</div>
      </div>
    </div>
  );
};
