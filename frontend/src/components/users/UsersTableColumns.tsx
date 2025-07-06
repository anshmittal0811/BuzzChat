/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types";
import { UserActionButton } from "@/components/users/UserActionButton";
import { USERS_CONSTANTS } from "@/constants/users";

export const createUsersTableColumns = (
  currentUser: IUser | null,
  groups: any[],
  groupMembers: Record<string, IUser[]>,
  userMapRef: React.RefObject<Record<string, IUser>>,
  setGroups: React.Dispatch<React.SetStateAction<any[]>>,
  setGroupMessages: React.Dispatch<React.SetStateAction<Record<string, any[]>>>,
  setGroupMembers: React.Dispatch<React.SetStateAction<Record<string, IUser[]>>>,
  setActiveGroup: (group: any) => void
): ColumnDef<IUser>[] => [
  {
    accessorKey: "firstName",
    header: USERS_CONSTANTS.HEADERS.FIRST_NAME,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("firstName")}</div>
    ),
  },
  {
    accessorKey: "lastName",
    header: USERS_CONSTANTS.HEADERS.LAST_NAME,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("lastName")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: () => {
      return <Button variant="ghost">{USERS_CONSTANTS.HEADERS.EMAIL}</Button>;
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("email")}</div>
    ),
  },
  {
    header: USERS_CONSTANTS.HEADERS.ACTION,
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <UserActionButton
          user={user}
          currentUser={currentUser}
          groups={groups}
          groupMembers={groupMembers}
          userMapRef={userMapRef}
          setGroups={setGroups}
          setGroupMessages={setGroupMessages}
          setGroupMembers={setGroupMembers}
          onGroupCreate={() => {}}
          onSetActiveGroup={setActiveGroup}
        />
      );
    },
  },
]; 