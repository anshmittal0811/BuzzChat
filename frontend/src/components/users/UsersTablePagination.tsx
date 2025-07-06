import React from "react";
import { Button } from "@/components/ui/button";
import { PaginationInfo } from "@/types/users";
import { USERS_CONSTANTS } from "@/constants/users";

interface UsersTablePaginationProps {
  paginationInfo: PaginationInfo;
  isLoading: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const UsersTablePagination: React.FC<UsersTablePaginationProps> = ({
  paginationInfo,
  isLoading,
  onPreviousPage,
  onNextPage,
}) => {
  const { currentPage, totalPages, totalCount, itemsPerPage } = paginationInfo;

  const getResultsText = () => {
    if (totalCount === 0) return USERS_CONSTANTS.MESSAGES.NO_RESULTS_COUNT;
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalCount);
    
    return `${USERS_CONSTANTS.MESSAGES.SHOWING_RESULTS} ${startItem}-${endItem} ${USERS_CONSTANTS.MESSAGES.OF} ${totalCount}`;
  };

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-primary">
        {getResultsText()}
      </div>
      <div className="space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onPreviousPage}
          disabled={currentPage <= 1 || isLoading}
        >
          {USERS_CONSTANTS.BUTTONS.PREVIOUS}
        </Button>
        <span className="text-sm text-primary">
          {USERS_CONSTANTS.MESSAGES.PAGE} {currentPage}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage >= totalPages || isLoading}
        >
          {USERS_CONSTANTS.BUTTONS.NEXT}
        </Button>
      </div>
    </div>
  );
}; 