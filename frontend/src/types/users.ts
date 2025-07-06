/* eslint-disable @typescript-eslint/no-explicit-any */
import { IUser } from "@/types";

export interface UsersTableState {
  data: IUser[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  searchQuery: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
}

export interface UserSearchParams {
  query: string;
  page: number;
  limit: number;
}

export interface UserActionButtonProps {
  user: IUser;
  currentUser: IUser | null;
  onGroupCreate: (newGroup: any) => void;
  onSetActiveGroup: (group: any) => void;
} 