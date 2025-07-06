/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { UsersTableState } from "@/types/users";
import { USERS_CONSTANTS } from "@/constants/users";

export const useUsersTable = () => {
  const [state, setState] = useState<UsersTableState>({
    data: [],
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    isLoading: false,
    searchQuery: "",
  });

  const updateState = (updates: Partial<UsersTableState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const searchUsers = async (
    query: string,
    page = 1,
    limit = USERS_CONSTANTS.PAGINATION.ITEMS_PER_PAGE
  ) => {
    try {
      updateState({ isLoading: true });
      const response = await userService.fetchUsers(query, page, limit);
      
      updateState({
        data: response.data.data,
        currentPage: page,
        totalCount: response.data.total,
        totalPages: Math.ceil(response.data.total / limit),
        isLoading: false,
      });
    } catch (error) {
      console.error("Error searching users:", error);
      updateState({ isLoading: false });
    }
  };

  const handleSearchQueryChange = (query: string) => {
    updateState({ searchQuery: query });
  };

  const handlePreviousPage = () => {
    if (state.currentPage > 1) {
      searchUsers(state.searchQuery, state.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (state.currentPage < state.totalPages) {
      searchUsers(state.searchQuery, state.currentPage + 1);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(state.searchQuery, 1);
    }, USERS_CONSTANTS.PAGINATION.DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [state.searchQuery]);

  return {
    state,
    searchUsers,
    handleSearchQueryChange,
    handlePreviousPage,
    handleNextPage,
  };
}; 