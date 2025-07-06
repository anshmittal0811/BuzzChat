/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGroup, IUser } from '@/types';
import { GROUP_CONSTANTS } from '@/constants/group';

/**
 * Validates group form data
 */
export const validateGroupForm = (groupName: string, selectedUsers: string[]) => {
  const errors: { groupName?: string; selectedUsers?: string } = {};

  if (!groupName.trim()) {
    errors.groupName = GROUP_CONSTANTS.VALIDATION.GROUP_NAME_REQUIRED;
  }

  if (selectedUsers.length === 0) {
    errors.selectedUsers = GROUP_CONSTANTS.VALIDATION.USERS_REQUIRED;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Creates a group object from API response
 */
export const createGroupFromResponse = (
  groupId: string,
  groupName: string
): IGroup => ({
  _id: groupId,
  name: groupName,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Filters users based on search criteria
 */
export const filterUsers = (users: IUser[], searchTerm: string): IUser[] => {
  if (!searchTerm.trim()) return users;

  const lowercaseSearch = searchTerm.toLowerCase();
  return users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(lowercaseSearch) ||
      user.lastName.toLowerCase().includes(lowercaseSearch) ||
      user.email.toLowerCase().includes(lowercaseSearch)
  );
};

/**
 * Formats user display name
 */
export const formatUserDisplayName = (user: IUser): string => {
  return `${user.firstName} ${user.lastName}`;
};

/**
 * Checks if the current viewport is desktop
 */
export const isDesktopViewport = (): boolean => {
  return window.innerWidth >= GROUP_CONSTANTS.UI.DESKTOP_BREAKPOINT;
};

/**
 * Debounces a function call
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}; 