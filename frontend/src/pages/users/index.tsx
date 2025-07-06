"use client";
import * as React from "react";
import { useState } from "react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import { useUsersTable } from "@/hooks/use-users-table";
import { createUsersTableColumns } from "@/components/users/UsersTableColumns";
import { UsersTableSearch } from "@/components/users/UsersTableSearch";
import { UsersDataTable } from "@/components/users/UsersDataTable";
import { UsersTablePagination } from "@/components/users/UsersTablePagination";
import { USERS_CONSTANTS } from "@/constants/users";

export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    groups,
    userMapRef,
    setGroups,
    setGroupMessages,
    setGroupMembers,
    groupMembers,
    setActiveGroup,
  } = useChat();
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  const {
    state: tableState,
    handleSearchQueryChange,
    handlePreviousPage,
    handleNextPage,
  } = useUsersTable();

  const columns = createUsersTableColumns(
    currentUser,
    groups,
    groupMembers,
    userMapRef,
    setGroups,
    setGroupMessages,
    setGroupMembers,
    setActiveGroup
  );

  const table = useReactTable({
    data: tableState.data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const paginationInfo = {
    currentPage: tableState.currentPage,
    totalPages: tableState.totalPages,
    totalCount: tableState.totalCount,
    itemsPerPage: USERS_CONSTANTS.PAGINATION.ITEMS_PER_PAGE,
  };

  return (
    <div className="w-full h-full px-10">
      <UsersTableSearch
        searchQuery={tableState.searchQuery}
        onSearchChange={handleSearchQueryChange}
        onTableFilterChange={(value) => table.getColumn("email")?.setFilterValue(value)}
      />
      
      <UsersDataTable
        table={table}
        isLoading={tableState.isLoading}
        columnsLength={columns.length}
      />
      
      <UsersTablePagination
        paginationInfo={paginationInfo}
        isLoading={tableState.isLoading}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
};

export default Users;
