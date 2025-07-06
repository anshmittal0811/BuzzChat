import { IGroup, IUser } from '@/types';

export interface GroupFormData {
  groupName: string;
  selectedUsers: string[];
}

export interface GroupFormErrors {
  groupName?: string;
  selectedUsers?: string;
}

export interface GroupFormProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export interface UserSelectionProps {
  users: IUser[];
  selectedUsers: string[];
  onToggleUser: (userId: string) => void;
  isLoading?: boolean;
}

export interface GroupFormContentProps {
  formData: GroupFormData;
  errors: GroupFormErrors;
  users: IUser[];
  isLoading: boolean;
  onFormDataChange: (data: Partial<GroupFormData>) => void;
  onSearchChange: (search: string) => void;
  onDeselectAll: () => void;
  onToggleUser: (userId: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface CreateGroupRequest {
  name: string;
  memberIds: string[];
}

export interface CreateGroupResponse {
  groupId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Re-export types for convenience
export type { IGroup, IUser }; 