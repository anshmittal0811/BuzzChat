import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useChat } from '@/contexts/chat-context';
import { useToast } from '@/hooks/use-toast';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';
import { GROUP_CONSTANTS, GROUP_FORM_VALIDATION } from '@/constants/group';
import { 
  GroupFormData, 
  GroupFormErrors, 
  IUser, 
  IGroup,
  CreateGroupResponse 
} from '@/types/group';

export const useGroupForm = (onClose: () => void) => {
  const { user: currentUser } = useAuth();
  const {
    userMapRef,
    setGroups,
    setGroupMessages,
    setGroupMembers,
    setActiveGroup,
  } = useChat();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<GroupFormData>({
    groupName: '',
    selectedUsers: [],
  });
  const [errors, setErrors] = useState<GroupFormErrors>({});
  const [search, setSearch] = useState<string>('');
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Debounced user search
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (search.trim() || search === '') {
        setIsLoading(true);
        try {
          const response = await userService.fetchUsers(
            search, 
            1, 
            GROUP_CONSTANTS.UI.MAX_USERS_PER_PAGE
          );
          setUsers(response.data?.data || []);
        } catch (error) {
          console.error('Error fetching users:', error);
          setUsers([]);
        } finally {
          setIsLoading(false);
        }
      }
    }, GROUP_CONSTANTS.UI.SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [search]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: GroupFormErrors = {};

    if (!formData.groupName.trim()) {
      newErrors.groupName = GROUP_CONSTANTS.VALIDATION.GROUP_NAME_REQUIRED;
    } else if (formData.groupName.length > GROUP_FORM_VALIDATION.groupName.maxLength) {
      newErrors.groupName = `Group name must be less than ${GROUP_FORM_VALIDATION.groupName.maxLength} characters`;
    }

    if (formData.selectedUsers.length === 0) {
      newErrors.selectedUsers = GROUP_CONSTANTS.VALIDATION.USERS_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form handlers
  const handleFormDataChange = useCallback((data: Partial<GroupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Clear errors when user starts typing
    if (data.groupName !== undefined && errors.groupName) {
      setErrors(prev => ({ ...prev, groupName: undefined }));
    }
    if (data.selectedUsers !== undefined && errors.selectedUsers) {
      setErrors(prev => ({ ...prev, selectedUsers: undefined }));
    }
  }, [errors]);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
  }, []);

  const handleToggleUser = useCallback((userId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setFormData(prev => ({ ...prev, selectedUsers: [] }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ groupName: '', selectedUsers: [] });
    setErrors({});
    setSearch('');
    setUsers([]);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !currentUser?._id) return;

    setIsCreating(true);
    try {
      const response = await chatService.createGroup(
        formData.groupName,
        [...formData.selectedUsers, currentUser._id]
      );

      const groupData = response?.data as CreateGroupResponse;
      if (!groupData?.groupId) {
        throw new Error('Invalid response from server');
      }

      // Create new group object
      const newGroup: IGroup = {
        _id: groupData.groupId,
        name: formData.groupName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update chat context
      setGroups(prevGroups => [...prevGroups, newGroup]);
      setGroupMessages(prev => ({ ...prev, [groupData.groupId]: [] }));
      setGroupMembers(prev => ({ 
        ...prev, 
        [groupData.groupId]: [currentUser, ...users.filter(u => formData.selectedUsers.includes(u._id))] 
      }));

      // Update user map
      users.forEach(user => {
        userMapRef.current[user._id] = user;
      });

      setActiveGroup(newGroup);
      onClose();
      resetForm();

      toast({
        title: GROUP_CONSTANTS.MESSAGES.SUCCESS_TITLE,
        description: GROUP_CONSTANTS.MESSAGES.SUCCESS_DESCRIPTION,
        variant: "default",
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: GROUP_CONSTANTS.MESSAGES.ERROR_CREATING_GROUP,
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }, [formData, currentUser, users, validateForm, onClose, resetForm, toast, setGroups, setGroupMessages, setGroupMembers, setActiveGroup, userMapRef]);

  const handleCancel = useCallback(() => {
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  return {
    formData,
    errors,
    search,
    users,
    isLoading,
    isCreating,
    handleFormDataChange,
    handleSearchChange,
    handleToggleUser,
    handleDeselectAll,
    handleSubmit,
    handleCancel,
  };
}; 