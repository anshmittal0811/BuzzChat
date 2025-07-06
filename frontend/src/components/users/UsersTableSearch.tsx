import React from "react";
import { Input } from "@/components/ui/input";
import { USERS_CONSTANTS } from "@/constants/users";

interface UsersTableSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTableFilterChange: (value: string) => void;
}

export const UsersTableSearch: React.FC<UsersTableSearchProps> = ({
  searchQuery,
  onSearchChange,
  onTableFilterChange,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onSearchChange(value);
    onTableFilterChange(value);
  };

  return (
    <div className="flex items-center py-4">
      <Input
        placeholder={USERS_CONSTANTS.MESSAGES.FILTER_PLACEHOLDER}
        value={searchQuery}
        onChange={handleInputChange}
        className="max-w-sm text-white"
      />
    </div>
  );
}; 