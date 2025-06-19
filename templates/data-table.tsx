"use client"

import * as React from "react"
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
  Table as TanStackTable,
  Column,
} from "@tanstack/react-table"
import { 
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"



// Column Header Component
interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  align?: "start" | "center" | "end"
  canSort?: boolean
  canHide?: boolean
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  align = "start",
  canSort = true,
  canHide = true,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const alignmentClasses = {
    start: "justify-start text-left",
    center: "justify-center text-center",
    end: "justify-end text-right",
  }

  if (!canSort || !column.getCanSort()) {
    return (
      <div className={cn("flex items-center gap-2", alignmentClasses[align], className)}>
        {title}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", alignmentClasses[align], className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="data-[state=open]:bg-accent -ml-3 h-8"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          {canHide && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Pagination Component
interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>
  showRowSelection?: boolean
  showRowsPerPage?: boolean
  showPageInfo?: boolean
  showFirstLastButtons?: boolean
  showPreviousNextButtons?: boolean
  pageSizeOptions?: number[]
  rowSelectionText?: string
  rowsPerPageText?: string
  pageInfoFormat?: (currentPage: number, totalPages: number) => string
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

function DataTablePagination<TData>({
  table,
  showRowSelection = true,
  showRowsPerPage = true,
  showPageInfo = true,
  showFirstLastButtons = true,
  showPreviousNextButtons = true,
  pageSizeOptions = [10, 20, 25, 30, 40, 50],
  rowSelectionText = "row(s) selected",
  rowsPerPageText = "Rows per page",
  pageInfoFormat = (currentPage, totalPages) => `Page ${currentPage} of ${totalPages}`,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const selectedRows = table.getFilteredSelectedRowModel().rows.length
  const totalRows = table.getFilteredRowModel().rows.length

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value)
    table.setPageSize(newPageSize)
    onPageSizeChange?.(newPageSize)
  }

  const handlePageChange = (newPage: number) => {
    table.setPageIndex(newPage - 1)
    onPageChange?.(newPage)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
      {showRowSelection && (
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedRows} of {totalRows} {rowSelectionText}.
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
        {showRowsPerPage && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{rowsPerPageText}</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {showPageInfo && (
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {pageInfoFormat(currentPage, totalPages)}
          </div>
        )}
        {(showFirstLastButtons || showPreviousNextButtons) && (
          <div className="flex items-center space-x-2">
            {showFirstLastButtons && (
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(1)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            )}
            {showPreviousNextButtons && (
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {showPreviousNextButtons && (
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {showFirstLastButtons && (
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(totalPages)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// View Options Component (Column Toggle)
interface DataTableViewOptionsProps<TData> {
  table: TanStackTable<TData>
}

function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}



// Generic DataTable component for reuse
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  sortableColumns?: string[]
  hideableColumns?: string[]
  searchColumn?: string
  showSearch?: boolean
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  // Pagination props
  showRowSelection?: boolean
  showRowsPerPage?: boolean
  showPageInfo?: boolean
  showFirstLastButtons?: boolean
  showPreviousNextButtons?: boolean
  pageSizeOptions?: number[]
  rowSelectionText?: string
  rowsPerPageText?: string
  pageInfoFormat?: (currentPage: number, totalPages: number) => string
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

function DataTable<TData, TValue>({
  columns,
  data,
  sortableColumns = [],
  hideableColumns = [],
  searchColumn,
  showSearch = true,
  onSearch,
  searchPlaceholder = "Search...",
  // Pagination props
  showRowSelection = true,
  showRowsPerPage = true,
  showPageInfo = true,
  showFirstLastButtons = true,
  showPreviousNextButtons = true,
  pageSizeOptions = [10, 20, 25, 30, 40, 50],
  rowSelectionText = "row(s) selected",
  rowsPerPageText = "Rows per page",
  pageInfoFormat = (currentPage, totalPages) => `Page ${currentPage} of ${totalPages}`,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      {showSearch && searchColumn && (
        <div className="flex items-center py-4">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              const value = event.target.value
              table.getColumn(searchColumn)?.setFilterValue(value)
              onSearch?.(value)
            }}
            className="max-w-sm"
          />
          <DataTableViewOptions table={table} />
        </div>
      )}
      {!showSearch && (
        <div className="flex items-center py-4">
          <DataTableViewOptions table={table} />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                  )
                })}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="py-4">
        <DataTablePagination 
          table={table}
          showRowSelection={showRowSelection}
          showRowsPerPage={showRowsPerPage}
          showPageInfo={showPageInfo}
          showFirstLastButtons={showFirstLastButtons}
          showPreviousNextButtons={showPreviousNextButtons}
          pageSizeOptions={pageSizeOptions}
          rowSelectionText={rowSelectionText}
          rowsPerPageText={rowsPerPageText}
          pageInfoFormat={pageInfoFormat}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

export {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableViewOptions,
  DataTable,
} 