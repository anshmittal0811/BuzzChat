"use client";
import * as React from "react";
import {
  useEffect,
  useState,
} from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IGroup, IUser } from "@/types";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import { userService } from "@/services/userService";

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
  const [data, setData] = useState<IUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "firstName",
      header: "First Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("firstName")}</div>
      ),
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("lastName")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: () => {
        return <Button variant="ghost">Email</Button>;
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      header: "Action",
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        if (currentUser) {
          const existingGroup = groups.find((group) => {
            const members = groupMembers[group._id];
            if (!members || group.name) return false; // skip if named or invalid

            const memberIds = members.map((m: IUser) => m._id);
            return (
              memberIds.length === 2 &&
              memberIds.includes(currentUser._id) &&
              memberIds.includes(user._id)
            );
          });

          if (existingGroup) {
            return (
              <Button
                className="rounded-full"
                onClick={() => setActiveGroup(existingGroup)}
              >
                Send Message
              </Button>
            );
          } else {
            return (
              <Button
                className="rounded-full"
                onClick={async () => {
                  if (user) {
                    const group = (
                      await chatService.createGroup(null, [
                        currentUser._id,
                        user?._id,
                      ])
                    )?.data;

                    const id = group?.groupId;

                    const newGroup = {
                      _id: id,
                      name: null,
                      createdAt: Date.now().toString(),
                      updatedAt: Date.now().toString(),
                    } as IGroup;
                    setGroups((prevGroups) => [...prevGroups, newGroup]);

                    setGroupMessages((prev) => ({
                      ...prev,
                      [id]: [],
                    }));

                    setGroupMembers((prev) => ({
                      ...prev,
                      [id]: [currentUser, user],
                    }));

                    userMapRef.current[user?._id] = user;
                    setActiveGroup(newGroup);
                  }
                }}
              >
                Connect
              </Button>
            );
          }
        }
      },
    },
  ];

  const table = useReactTable({
    data,
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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery, 1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  async function searchUsers(query: string, page = 1, limit = 8) {
    try {
      setIsLoading(true);
      const response = await userService.fetchUsers(query, page, limit);
      setData(response.data.data);
      setCurrentPage(page);
      setTotalCount(response.data.total);
      setTotalPages(Math.ceil(response.data.total / limit));
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full h-full px-10">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            table.getColumn("email")?.setFilterValue(event.target.value);
          }}
          className="max-w-sm text-white"
        />
      </div>
      <div className="rounded-md border border-secondary">
        <Table className="rounded-xl">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="pointer-events-none border-none"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-white"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border border-secondary text-white"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-white">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-white"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-primary">
          {totalCount > 0 ? (
            <>
              Showing {((currentPage - 1) * 8) + 1}-{Math.min(currentPage * 8, totalCount)} of {totalCount}
            </>
          ) : (
            "No results"
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              searchUsers(searchQuery, currentPage - 1);
            }}
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-primary">
            Page {currentPage}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              searchUsers(searchQuery, currentPage + 1);
            }}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Users;
