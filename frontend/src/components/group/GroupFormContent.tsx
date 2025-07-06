import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserSelection } from './UserSelection';
import { GROUP_CONSTANTS } from '@/constants/group';
import { GroupFormContentProps } from '@/types/group';

export const GroupFormContent: React.FC<GroupFormContentProps> = ({
  formData,
  errors,
  users,
  isLoading,
  onFormDataChange,
  onSearchChange,
  onDeselectAll,
  onToggleUser,
  onSubmit,
  onCancel,
}) => {
  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ groupName: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const isFormValid = formData.groupName.trim() && formData.selectedUsers.length > 0;

  return (
    <div className="space-y-4">
      {/* Group Name Input */}
      <div className="space-y-2">
        <Label htmlFor="groupName">Group Name</Label>
        <Input
          id="groupName"
          placeholder={GROUP_CONSTANTS.PLACEHOLDERS.GROUP_NAME}
          value={formData.groupName}
          onChange={handleGroupNameChange}
          className={errors.groupName ? 'border-destructive' : ''}
        />
        {errors.groupName && (
          <Alert variant="destructive">
            <AlertDescription>{errors.groupName}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* User Search Input */}
      <div className="space-y-2">
        <Label htmlFor="userSearch">Search Users</Label>
        <Input
          id="userSearch"
          placeholder={GROUP_CONSTANTS.PLACEHOLDERS.SEARCH_USERS}
          onChange={handleSearchChange}
        />
      </div>

      {/* User Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {formData.selectedUsers.length} user{formData.selectedUsers.length !== 1 ? 's' : ''} selected
        </div>
        <Button 
          variant="secondary" 
          onClick={onDeselectAll} 
          size="sm"
          disabled={formData.selectedUsers.length === 0}
        >
          {GROUP_CONSTANTS.TITLES.DESELECT_ALL}
        </Button>
      </div>

      {/* User Selection */}
      <UserSelection
        users={users}
        selectedUsers={formData.selectedUsers}
        onToggleUser={onToggleUser}
        isLoading={isLoading}
      />

      {/* Form Validation Error */}
      {errors.selectedUsers && (
        <Alert variant="destructive">
          <AlertDescription>{errors.selectedUsers}</AlertDescription>
        </Alert>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          variant="secondary" 
          onClick={onCancel}
          type="button"
        >
          {GROUP_CONSTANTS.TITLES.CANCEL}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isFormValid}
          type="submit"
        >
          {GROUP_CONSTANTS.TITLES.CREATE}
        </Button>
      </div>
    </div>
  );
}; 