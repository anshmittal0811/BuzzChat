import React from "react";
import { flexRender, Table as TanstackTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IUser } from "@/types";
import { USERS_CONSTANTS } from "@/constants/users";

interface UsersDataTableProps {
  table: TanstackTable<IUser>;
  isLoading: boolean;
  columnsLength: number;
}

export const UsersDataTable: React.FC<UsersDataTableProps> = ({
  table,
  isLoading,
  columnsLength,
}) => {
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell
            colSpan={columnsLength}
            className="h-24 text-center text-white"
          >
            {USERS_CONSTANTS.MESSAGES.LOADING}
          </TableCell>
        </TableRow>
      );
    }

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          className="border border-secondary text-white"
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className="text-white">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell
          colSpan={columnsLength}
          className="h-24 text-center text-white"
        >
          {USERS_CONSTANTS.MESSAGES.NO_RESULTS}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="rounded-md border border-secondary">
      <Table className="rounded-xl">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="pointer-events-none border-none"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
    </div>
  );
}; 