"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleXIcon,
  EllipsisIcon,
} from "lucide-react";
import { Trade, Strategy } from "@/lib/db/drizzle/schema";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LogTradeSheet from "@/components/trades/log-trade-sheet";

interface TradesTableProps {
  strategy: Strategy;
  isBacktest?: boolean;
}

export default function TradesTable({
  strategy,
  isBacktest = false,
}: TradesTableProps) {
  const queryClient = useQueryClient();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return null;
    return format(new Date(date), "MMMM d, yyyy");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "order_placed":
        return "bg-yellow-100 text-yellow-800 border-yellow-100 rounded-sm";
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-100 rounded-sm";
      case "closed":
        return "bg-gray-200 text-gray-800 border-gray-200 rounded-sm";
      default:
        return "";
    }
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case "win":
        return "bg-emerald-100 text-emerald-800 border-emerald-100 rounded-sm";
      case "break_even":
        return "bg-gray-200 text-gray-800 border-gray-200 rounded-sm";
      case "loss":
        return "bg-red-100 text-red-800 border-red-100 rounded-sm";
      default:
        return "bg-muted text-muted-foreground rounded-sm";
    }
  };

  // Define fetch function for React Query
  const fetchTrades = async () => {
    const sortField = sorting.length > 0 ? sorting[0].id : "createdAt";
    const sortDirection =
      sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc";

    const response = await fetch(
      `/api/trades?strategyId=${strategy.id}&isBacktest=${isBacktest}&pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}&sortField=${sortField}&sortDirection=${sortDirection}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch trades");
    }

    return response.json();
  };

  // Use React Query to fetch trades
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "trades",
      strategy.id,
      isBacktest,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: fetchTrades,
  });

  const { trades, pageCount } = useMemo(
    () => ({
      trades: data?.trades || [],
      pageCount: data?.pageCount || 0,
    }),
    [data]
  );

  // Define columns
  const columns: ColumnDef<Trade>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Asset",
      accessorKey: "asset",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("asset")}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(getStatusColor(row.getValue("status")))}
        >
          {row.getValue("status") === "order_placed"
            ? "Order Placed"
            : row.getValue("status") === "open"
            ? "Open"
            : "Closed"}
        </Badge>
      ),
    },
    {
      header: "Date",
      accessorKey: "dateOpened",
      cell: ({ row }) => (
        <div className="text-xs font-medium">
          {row.original.dateOpened && (
            <div>
              <span className="text-muted-foreground">open:</span>{" "}
              {formatDate(row.original.dateOpened)}
            </div>
          )}
          {row.original.dateClosed && (
            <div>
              <span className="text-muted-foreground">close:</span>{" "}
              {formatDate(row.original.dateClosed)}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Result",
      accessorKey: "result",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(getResultColor(row.original.result))}
        >
          {row.original.result
            ? row.original.result.charAt(0).toUpperCase() +
              row.original.result.slice(1).replace("_", " ")
            : "N/A"}
        </Badge>
      ),
    },
    {
      header: "P&L",
      accessorKey: "profitLoss",
      cell: ({ row }) => {
        const pl = row.original.profitLoss;
        const value = pl ? parseFloat(pl) : 0;
        return (
          <div
            className={cn(
              "font-medium",
              value >= 0 ? "text-emerald-500" : "text-red-500"
            )}
          >
            {value.toFixed(2)}%
          </div>
        );
      },
    },
    // Generate columns for each custom field dynamically
    ...useMemo(() => {
      // Extract custom fields from the first trade or show empty array if no trades
      if (!trades.length) return [];

      const customFields = Object.keys(trades[0]?.customValues || {});

      return customFields.map((fieldName) => ({
        id: `customField_${fieldName}`,
        header: fieldName,
        accessorFn: (row: Trade) => row.customValues[fieldName],
        cell: ({ row, getValue }: { row: Row<Trade>; getValue: () => any }) => {
          const value = getValue();
          if (Array.isArray(value)) {
            return (
              <div className="flex flex-wrap gap-1">
                {value.map((item, index) => (
                  <Badge
                    key={`${fieldName}-${index}`}
                    className="bg-gray-200 text-gray-800 border-gray-200 rounded-sm"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            );
          }
          return <div className="text-sm">{value}</div>;
        },
      }));
    }, [trades]),
    {
      id: "actions",
      cell: ({ row }) => <TradeActions trade={row.original} />,
      enableHiding: false,
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: trades,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: false,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  });

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trade journal</CardTitle>
        <LogTradeSheet
          strategy={strategy}
          isBacktest={isBacktest}
          onSuccess={() => {
            // Invalidate the trades query to trigger a refetch
            queryClient.invalidateQueries({
              queryKey: ["trades", strategy.id, isBacktest],
            });
          }}
        />
      </CardHeader>
      <CardContent>
        {/* Table */}
        {isLoading ? (
          <div className="h-[400px] w-full flex items-center justify-center">
            <div className="text-muted-foreground">Loading trades...</div>
          </div>
        ) : isError ? (
          <div className="h-[200px] w-full flex items-center justify-center">
            <div className="text-red-500">
              Failed to load trades. Please try again.
            </div>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                "flex cursor-pointer items-center justify-between gap-2 select-none"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: (
                                <ChevronUpIcon
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                              desc: (
                                <ChevronDownIcon
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
                      className="h-24 text-center"
                    >
                      No trades found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <Pagination className="justify-end mr-2">
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirstIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}

function TradeActions({ trade }: { trade: Trade }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisIcon size={16} aria-hidden="true" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Edit trade</DropdownMenuItem>
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          Delete trade
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
