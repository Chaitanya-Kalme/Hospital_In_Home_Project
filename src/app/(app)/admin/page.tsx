'use client'
import { Button } from "@/components/ui/button"
import axios from "axios"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { getSession } from "next-auth/react"
import { useEffect, useState } from "react"
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
import { ArrowUpDown, ChevronDown, Paperclip } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    subscriptions: subscriptionRequests[],
    documentForVerification: String[]
}


// Patient Column
export const columns: ColumnDef<User>[] = [
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
        accessorFn: (row) => row.subscriptions.length,
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
        accessorKey: "View Profile",
        header: ({ column }) => {
            return <div></div>
        },
        cell: ({ row }) => {
            const subscriptions:subscriptionRequests[]= row.getValue("subscriptionList")
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
                                            Doctor's Name: {subscription.doctor?.userName}
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
    // {
    //     accessorFn: (row) => row.messages,
    //     accessorKey: "Chat Section",
    //     header: ({ column }) => {
    //         return <div></div>
    //     },
    //     cell: ({ row }) => {
    //         const doctorName = row.getValue("userName") as string
    //         const doctorEmail = row.getValue("email") as string
    //         const doctor = row.getValue("View Profile") as User
    //         const [messageText, setMessageText] = useState("")
    //         const [messageArray, setMessageArray] = useState<Message[]>([])
    //         const [messageDocument, setMessageDocument] = useState<File | null>(null)
    //         const patient = row.getValue("patient") as User
    //         useEffect(() => {
    //             const messages: Message[] = row.getValue('Chat Section')
    //             setMessageArray(messages)
    //         }, [messageArray])

    //         setTimeout(async () => {
    //             const messages: Message[] = row.getValue('Chat Section')
    //             setMessageArray(messages)
    //         }, 1000);
    //         const subscriptionId = row.getValue('subscriptionId') as string


    //         const sendMessage = async () => {
    //             const session = await getSession()
    //             const userId = session?.user.id as string
    //             const role = session?.user.role as string

    //             const messageFormData = new FormData()
    //             messageFormData.append('messageText', messageText)
    //             messageFormData.append('userId', userId)
    //             messageFormData.append('role', role)
    //             messageFormData.append('messageDocument', messageDocument as File)

    //             await axios.post(`/api/message/createMessage/${subscriptionId}`, messageFormData)
    //                 .then((response) => {
    //                     toast.success("Message send sucessfully")
    //                 })
    //                 .catch((error) => {
    //                     console.log(error)
    //                     toast.error(error.message)
    //                 })
    //             setMessageText("")
    //         }

    //         return (
    //             <AlertDialog>
    //                 <AlertDialogTrigger asChild>
    //                     <Button variant="outline">Chat Section</Button>
    //                 </AlertDialogTrigger>
    //                 <AlertDialogContent className="min-h-svh overflow-scroll">
    //                     <AlertDialogCancel className="w-fit ">Cancel</AlertDialogCancel>
    //                     <AlertDialogHeader>
    //                         <AlertDialogTitle >
    //                             <p>Doctor Name: {doctorName}</p>
    //                             <p>Doctor Email: {doctorEmail}</p>
    //                         </AlertDialogTitle>
    //                         <AlertDialogDescription className="border-2 w-full overflow-y-auto">
    //                             <ScrollArea id="scroll_area" className="rounded-md border h-72 md:h-80">
    //                                 {
    //                                     messageArray?.length > 0 && messageArray.map((message) => (
    //                                         <div key={message.id} className={`w-full ${message.userId === doctor.id ? "text-right" : "text-right"}`}>
    //                                             <div className={`bg-white border-2 ${message.userId === doctor.id ? "justify-items-start" : "justify-items-end"} text-black`}>
    //                                                 <div className="font-semibold">{message.userId === doctor.id ? doctorName : patient?.userName}</div>
    //                                                 <div>{message.messageText}</div>
    //                                                 {message.messageDocument && (
    //                                                     <a href={message.messageDocument}>Open the file</a>
    //                                                 )}
    //                                             </div>

    //                                         </div>
    //                                     ))
    //                                 }
    //                             </ScrollArea>
    //                         </AlertDialogDescription>
    //                     </AlertDialogHeader>

    //                     <AlertDialogFooter>
    //                         <div className="grid w-full gap-2">
    //                             <div className="flex">
    //                                 <Paperclip />
    //                                 <Input type="file" onChange={(e) => {
    //                                     const files: FileList | null = e.target.files
    //                                     if (files) {
    //                                         setMessageDocument(files[0])
    //                                     }

    //                                 }} />
    //                             </div>
    //                             <Textarea value={messageText} placeholder="Type your message here." onChange={(e) => setMessageText(e.target.value)} />
    //                             <Button onClick={() => sendMessage()}>Send message</Button>
    //                         </div>
    //                     </AlertDialogFooter>
    //                 </AlertDialogContent>
    //             </AlertDialog>

    //         )

    //     }
    // },

]

// Doctor Column
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
        accessorFn: (row) => row.subscriptions.length,
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
                                            <div className="text-center">
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
]



export default function HomePage() {
    const [adminLoggedIn, setAdminLoggedIn] = useState(false)

    const [totalDoctors, setTotalDoctors] = useState(0)
    const [totalRegisteredPatients, setTotalRegisteredPatients] = useState(0)

    const [doctorsData, setDoctorsData] = useState<User[]>([])
    const [patientData, setPatientData] = useState<User[]>([])

    const [patientRecordVisible, setPatientRecordVisible] = useState(false)
    const [doctorRecordVisible, setDoctorRecordVisible] = useState(false)
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
            const session = await getSession()
            if (session?.user && session.user.role === "Admin") {
                setAdminLoggedIn(true)
            }
            const doctorListResponse = await axios.get('/api/doctor/getDoctor?type=All')
            setTotalDoctors(doctorListResponse.data.doctors.length)
            setDoctorsData(doctorListResponse.data.doctors)
            const patientListResponse = await axios.patch('/api/patient/getPatient')
            setTotalRegisteredPatients(patientListResponse.data.patients.length)
            setPatientData(patientListResponse.data.patients)

        }
        checkLoggedIn()
    },[])


    const patientTable = useReactTable({
            data: patientData,
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



    if (!adminLoggedIn) {
        return <div className="text-center font-bold text-4xl underline italic">
            Please Login to See the Admin Panel !!
        </div>
    }

    return (
        <div>
            <div className="font-bold text-center text-2xl">Total Doctors Registered: {totalDoctors}</div>
            <div className="font-bold text-center text-2xl">Total Patients Registered: {totalRegisteredPatients}</div>
            <div className="flex flex-wrap justify-between md:mx-52 mb-5">
                <Button onClick={() => {
                    setPatientRecordVisible(!patientRecordVisible)
                    setDoctorRecordVisible(false)
                }}>Find Patient Record</Button>
                <Button onClick={() => {
                    setDoctorRecordVisible(!doctorRecordVisible)
                    setPatientRecordVisible(false)
                }}>Find Doctor Record</Button>
            </div>
            {patientRecordVisible&& (<div>
                <div className="w-full p-4">
                    <div className="flex items-center py-4">
                        <Input
                            placeholder="Filter emails..."
                            value={(patientTable.getColumn("email")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                patientTable.getColumn("email")?.setFilterValue(event.target.value)
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
                                {patientTable
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide() && column.id !== "userId" && column.id!=="mobileNo" && column.id!=="avatar" && column.id!=="subscriptionList")
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
                                {patientTable.getHeaderGroups().map((headerGroup) => (
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
                                {patientTable.getRowModel().rows?.length ? (
                                    patientTable.getRowModel().rows.map((row) => (
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
                            {patientTable.getFilteredSelectedRowModel().rows.length} of{" "}
                            {patientTable.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => patientTable.previousPage()}
                                disabled={!patientTable.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => patientTable.nextPage()}
                                disabled={!patientTable.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>

                </div>
            </div>)}

            {doctorRecordVisible && (<div>
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
            </div>)}
        </div>
    )

}