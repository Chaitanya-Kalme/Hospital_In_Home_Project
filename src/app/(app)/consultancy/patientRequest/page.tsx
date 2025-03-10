'use client'
import axios from "axios"
import { useEffect, useState } from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, RotateCwSquare } from "lucide-react"
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import ProfileCard from "@/components/profileCard"

export type Patient = {
    id: string,
    userName: string,
    avatar: string,
    email: string,
    mobileNo: string,
}

export type subscriptionRequests = {
    id: string,
    isApprovedByDoctor: boolean,
    detailsAboutProblem: string,
    createdAt: Date,
    patient: Patient
}

const acceptPatientRequest = async ({ subscriptionId }: { subscriptionId: string }) => {
    try {
        await axios.patch(`/api/subscription/approveSubscription/${subscriptionId}`)
            .then((response) => {
                console.log(response.data.message)
                if (response.status === 200) {
                    toast.success(response.data.message)
                    location.reload()
                }
                else {
                    toast.error(response.data.message)
                }
            })
    } catch (error: any) {
        console.log(error)
        toast.error(error.message)

    }
}

export const columns: ColumnDef<subscriptionRequests>[] = [
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
        accessorKey: "isApprovedByDoctor",
        header: "Approval Status",
        cell: ({ row }) => {
            const isApproved = row.getValue("isApprovedByDoctor"); // Get the boolean value
            return (
                <div className="capitalize">{isApproved ? "Approved" : "Not Approved"}</div>
            );
        },
    },
    {
        accessorFn: (row) => row.patient?.userName,
        accessorKey: "userName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    userName
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => {
            const userName = row.getValue('userName') as string
            return <div>{userName}</div>;
        },
    },
    {
        accessorFn: (row) => row.patient?.email,
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => {
            const email = row.getValue('email') as string
            return <div className="lowercase">{email}</div>;
        },
    },
    {
        accessorKey: "detailsAboutProblem",
        header: ({ column }) => {
            return (
                <Button variant="ghost">
                    Problem
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("detailsAboutProblem")}</div>,
    },
    {
        accessorFn: (row) => row.id,
        accessorKey: "subscriptionId",
        enableHiding: true,

    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const id = row.getValue("subscriptionId") as string
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => acceptPatientRequest({ subscriptionId: id })}>Approve Request</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default function PatientRequestPending() {

    const [pendingRequest, setPendingRequest] = useState<subscriptionRequests[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const getPendingRequest = async () => {
            setIsLoading(true)
            await axios.get('/api/subscription/getPendingRequest?isApprovedByDoctor=false')
                .then((response) => {
                    setPendingRequest(response.data.subscriptionsNotApprovedByDoctor)
                })
                .catch((error) => {
                    console.log(error)
                })

        }
        getPendingRequest()
        setIsLoading(false)
    }, [])

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        subscriptionId: false,
    })
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data: pendingRequest,
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
        }
    })

    const selectedRow= table.getSelectedRowModel().rows
    const acceptSelectedPatientRequest =async() =>{
        let isErrorHappend= false
        for(let i=0;i<selectedRow.length;i++){
            try {
                await axios.patch(`/api/subscription/approveSubscription/${selectedRow[i].original.id}`)
            } catch (error: any) {
                isErrorHappend=true
                console.log(error)
                toast.error(error.message)
            }
        }
        if(!isErrorHappend){
            toast.success("Request Accepted Successfully")
            location.reload()
        }
    }

    if (isLoading) {
        return (
            <div>Loading...</div>
        )
    }



    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter emails..."
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("email")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <Button variant="outline" className="ml-auto" onClick={() =>{
                        acceptSelectedPatientRequest()
                    }}>
                        Accept All Request
                    </Button>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide() && column.id !== "subscriptionId")
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
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

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
            {/* <div>
                <ProfileCard userName="userName" email="email" mobileNo="234" avatar="avatar"/>
            </div> */}
        </div>
    )
}