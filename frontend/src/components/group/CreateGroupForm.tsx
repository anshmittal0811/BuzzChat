import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { GroupFormContent } from './GroupFormContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useGroupForm } from '@/hooks/use-group-form';
import { GROUP_CONSTANTS } from '@/constants/group';
import { GroupFormProps } from '@/types/group';

export const CreateGroupForm: React.FC<GroupFormProps> = ({ open, setOpen }) => {
  const isDesktop = window.innerWidth >= GROUP_CONSTANTS.UI.DESKTOP_BREAKPOINT;
  
  const {
    formData,
    errors,
    users,
    isLoading,
    isCreating,
    handleFormDataChange,
    handleSearchChange,
    handleToggleUser,
    handleDeselectAll,
    handleSubmit,
    handleCancel,
  } = useGroupForm(() => setOpen(false));

  const formContentProps = {
    formData,
    errors,
    users,
    isLoading,
    onFormDataChange: handleFormDataChange,
    onSearchChange: handleSearchChange,
    onDeselectAll: handleDeselectAll,
    onToggleUser: handleToggleUser,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  };

  const TriggerButton = (
    <Button variant="outline" className="border-none" disabled={isCreating}>
      {GROUP_CONSTANTS.TITLES.CREATE_GROUP}
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {TriggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] text-white">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {GROUP_CONSTANTS.TITLES.CREATE_GROUP}
            </DialogTitle>
            <DialogDescription>
              {GROUP_CONSTANTS.MESSAGES.DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          <ErrorBoundary>
            <GroupFormContent {...formContentProps} />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {TriggerButton}
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-[425px] text-white">
        <DrawerHeader>
          <DrawerTitle className="text-primary">
            {GROUP_CONSTANTS.TITLES.CREATE_GROUP}
          </DrawerTitle>
          <DrawerDescription>
            {GROUP_CONSTANTS.MESSAGES.DESCRIPTION}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-5 pb-5">
          <ErrorBoundary>
            <GroupFormContent {...formContentProps} />
          </ErrorBoundary>
        </div>
      </DrawerContent>
    </Drawer>
  );
}; 