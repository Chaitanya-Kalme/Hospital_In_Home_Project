'use client'
import React, { useEffect, useState } from 'react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import axios from 'axios'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'




interface Message {
    id: string,
    userId: string,
    messageText: string,
    messageDocument: string,
}

export type subscriptionRequests = {
    id: string,
    isApprovedByDoctor: boolean,
    detailsAboutProblem: string,
    createdAt: Date,
    doctor: User,
    patient: User
    messages: Message[]
}

interface User {
    id: string
    userName: string,
    email: string,
    avatar: string,
    mobileNo: string,
    createdAt: Date,
    updatedAt: Date,
    specialities: string,
    isVerified: boolean,
    subscriptions: subscriptionRequests[],
    documentForVerification: String[]
}


const acceptDoctorRequest = async({ doctorId }: { doctorId: string }) => {
    try {
        await axios.patch(`/api/doctor/approveDoctor/${doctorId}`)
            .then((response) => {
                if (response.status === 200) {
                    toast.success(response.data.message)
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

export const columns2: ColumnDef<User>[] = [
    {
        accessorFn: (row) => row.userName,
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
        accessorFn: (row) => row.email,
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
        accessorFn: (row) => row.mobileNo,
        accessorKey: "mobileNumber",
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.id,
        accessorKey: "userId",
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.subscriptions?.length,
        accessorKey: "subscriptions",
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.avatar,
        accessorKey: "avatar",
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.subscriptions,
        accessorKey: "subscriptionList",
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.documentForVerification,
        accessorKey: "documentForVerification",
        enableHiding: true,
    },
    {
        accessorKey: "View Profile",
        header: ({ column }) => {
            return <div></div>
        },
        cell: ({ row }) => {
            const subscriptions:subscriptionRequests[]= row.getValue("subscriptionList")
            const documents:string[] = row.getValue("documentForVerification")
            return (
                <div className="text-center w-full justify-center flex">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">View Profile</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Profile</SheetTitle>
                            </SheetHeader>
                            <div className="grid gap-2 py-2">
                                <div className="flex justify-center items-center gap-2">
                                    <Avatar className="size-28">
                                        <AvatarImage src={row.getValue("avatar")} />
                                        <AvatarFallback>Avatar Image</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex justify-center items-center gap-2">
                                    <div className="text-center">
                                        Username: {row.getValue("userName")}
                                    </div>
                                </div>
                                <div className="flex justify-center items-center gap-2">
                                    <div className="text-center">
                                        Email: {row.getValue("email")}
                                    </div>
                                </div>
                                <div className="flex justify-center items-center gap-2">
                                    <div className="text-center">
                                        Mobile Number: {row.getValue("mobileNumber")}
                                    </div>
                                </div>
                                <div className="justify-center items-center gap-2 border-2">
                                    <div className="font-bold text-center">Documents:</div>
                                    {
                                        documents.map((document,index) =>(
                                            <div key={index} className="text-center">
                                                <a href={document}>Document {index+1}</a>
                                            </div>
                                        ))
                                    }
                                </div>

                            </div>
                            {
                                subscriptions.map((subscription,index) =>(
                                    <div key={index} className="justify-center items-center gap-4">
                                        <br />
                                        <div className="font-bold text-center">subscription {index+1}:</div>
                                        <div />
                                        <div className="text-center">
                                            Approval Status: {subscription.isApprovedByDoctor? "Approved": "Not Approved"}
                                        </div>
                                        <div className="text-center">
                                            Patient's Name: {subscription.patient.userName}
                                        </div>
                                        <div className="text-center">
                                            Problem: {subscription.detailsAboutProblem}
                                        </div>
                                    </div>
                                ))
                            }
                        </SheetContent>
                    </Sheet>
                </div>
            )
        }
    },
    {
        accessorKey: "Accept Request",
        header: ({ column }) => {
            return <div></div>
        },
        cell: ({ row }) => {
          const id: string = row.getValue("userId")
            return (
                <Button onClick={() => acceptDoctorRequest({doctorId: id})}>Accept Request</Button>
            )
        }
    },
]


function DoctorsRequestPage() {
  const [doctorsData, setDoctorsData] = useState<User[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
      userId: false,
      mobileNo: false,
      avatar: false,
      subscriptionList:false,
      documentForVerification: false

  })
  const [rowSelection, setRowSelection] = useState({})

  

    useEffect(() => {
      const checkLoggedIn = async () => {
          const doctorListResponse = await axios.get('/api/doctor/getDoctor?type=notVerified')
          setDoctorsData(doctorListResponse.data.doctors)
      }
      checkLoggedIn()
    },[])


    const doctorTable = useReactTable({
                data: doctorsData,
                columns: columns2,
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


  return (
    <div>
                <div className="w-full p-4">
                    <div className="flex items-center py-4">
                        <Input
                            placeholder="Filter emails..."
                            value={(doctorTable.getColumn("email")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                doctorTable.getColumn("email")?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto">
                                    Columns <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {doctorTable
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide() && column.id !== "userId" && column.id!=="mobileNo" && column.id!=="avatar" && column.id!=="subscriptionList" && column.id!=="documentForVerification")
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
                                {doctorTable.getHeaderGroups().map((headerGroup) => (
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
                                {doctorTable.getRowModel().rows?.length ? (
                                    doctorTable.getRowModel().rows.map((row) => (
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
                                        <TableCell colSpan={columns2.length} className="h-24 text-center">
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
                            {doctorTable.getFilteredSelectedRowModel().rows.length} of{" "}
                            {doctorTable.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => doctorTable.previousPage()}
                                disabled={!doctorTable.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => doctorTable.nextPage()}
                                disabled={!doctorTable.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
  )
}

export default DoctorsRequestPage