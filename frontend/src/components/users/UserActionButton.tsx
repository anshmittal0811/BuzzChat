/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button } from "@/components/ui/button";
import { IGroup, IUser } from "@/types";
import { UserActionButtonProps } from "@/types/users";
import { chatService } from "@/services/chatService";
import { USERS_CONSTANTS } from "@/constants/users";

interface UserActionButtonComponentProps extends UserActionButtonProps {
  groups: IGroup[];
  groupMembers: Record<string, IUser[]>;
  userMapRef: React.RefObject<Record<string, IUser>>;
  setGroups: React.Dispatch<React.SetStateAction<IGroup[]>>;
  setGroupMessages: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  setGroupMembers: React.Dispatch<React.SetStateAction<Record<string, IUser[]>>>;
}

export const UserActionButton: React.FC<UserActionButtonComponentProps> = ({
  user,
  currentUser,
  groups,
  groupMembers,
  userMapRef,
  setGroups,
  setGroupMessages,
  setGroupMembers,
  onSetActiveGroup,
}) => {
  if (!currentUser) return null;

  const existingGroup = groups.find((group) => {
    const members = groupMembers[group._id];
    if (!members || group.name) return false; // skip if named or invalid

    const memberIds = members.map((m: IUser) => m._id);
    return (
      memberIds.length === 2 &&
      memberIds.includes(currentUser._id) &&
      memberIds.includes(user._id)
    );
  });

  const handleCreateGroup = async () => {
    if (!user || !currentUser) return;

    try {
      const group = (
        await chatService.createGroup(null, [currentUser._id, user._id])
      )?.data;

      const id = group?.groupId;

      const newGroup = {
        _id: id,
        name: null,
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
        [id]: [currentUser, user],
      }));

      userMapRef.current[user._id] = user;
      onSetActiveGroup(newGroup);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  if (existingGroup) {
    return (
      <Button
        className="rounded-full"
        onClick={() => onSetActiveGroup(existingGroup)}
      >
        {USERS_CONSTANTS.BUTTONS.SEND_MESSAGE}
      </Button>
    );
  }

  return (
    <Button className="rounded-full" onClick={handleCreateGroup}>
      {USERS_CONSTANTS.BUTTONS.CONNECT}
    </Button>
  );
}; 