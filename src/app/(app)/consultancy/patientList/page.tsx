'use client'
import axios from "axios"
import { ReactNode, useEffect, useState } from "react"
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
import { ArrowUpDown, CalendarIcon, ChevronDown, ClockIcon, MoreHorizontal, Paperclip, RotateCwSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
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
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getSession } from "next-auth/react"
import { UploadDoctorDocuments } from "@/helper/uploadOnCloudinary"
import socket from "@/helper/useSocket"


interface Message {
    id: string,
    userId: string,
    messageText: string,
    messageDocument: string,
}


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
    patient: Patient,
    doctor: Patient
    messages: Message[]
}



const createAppointment = async ({ subscriptionId, date, appointmentMode }: { subscriptionId: string, date: Date, appointmentMode: string }) => {
    const formData = new FormData()
    formData.append('appointmentDateAndTime', date.toString())
    formData.append('appointmentMode', appointmentMode)

    await axios.post(`/api/subscription/createAppointment/${subscriptionId}`, formData)
        .then((response) => {
            toast.success(response.data.message)
        })
        .catch((error) => {
            console.log(error.response.data.message)
            toast.error(error.response.data.message)
        })
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
            const isApproved = row.getValue("isApprovedByDoctor");
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
                <div>
                    Problem
                </div>
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
        accessorFn: (row) => row.doctor,
        accessorKey: "doctor",
        enableHiding: true,

    },
    {
        accessorKey: "Set Appointment",
        header: ({ column }) => {
            return <div></div>
        },
        cell: ({ row }) => {
            const subscriptionId = row.getValue('subscriptionId') as string
            const [date, setDate] = useState<Date>();
            const [isOpen, setIsOpen] = useState(false);
            const [appointmentMode, setAppointmentMode] = useState("")

            const hours = Array.from({ length: 12 }, (_, i) => i + 1);
            const handleDateSelect = (selectedDate: Date | undefined) => {
                if (selectedDate) {
                    setDate(selectedDate);
                }
            };

            const handleTimeChange = (
                type: "hour" | "minute" | "ampm",
                value: string
            ) => {
                if (date) {
                    const newDate = new Date(date);
                    if (type === "hour") {
                        newDate.setHours(
                            (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
                        );
                    } else if (type === "minute") {
                        newDate.setMinutes(parseInt(value));
                    } else if (type === "ampm") {
                        const currentHours = newDate.getHours();
                        newDate.setHours(
                            value === "PM" ? currentHours + 12 : currentHours - 12
                        );
                    }
                    setDate(newDate);
                }
            };

            return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button>Set Appointment</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="overflow-y-scroll">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-center">Appointment Form</AlertDialogTitle>
                            <AlertDialogDescription className="text-center">
                                Create Appointment for Patient
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="p-2 space-x-3">
                            <div className="flex">Appointment Date and Time:</div>
                            <Popover open={isOpen} onOpenChange={setIsOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? (
                                            format(date, "dd/MM/yyyy hh:mm aa")
                                        ) : (
                                            <span>Pick a date and time</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <div className="sm:flex">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={handleDateSelect}
                                            initialFocus
                                        />
                                        <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x ">
                                            <ScrollArea className="w-64 sm:w-auto">
                                                <div className="flex sm:flex-col p-2">
                                                    {hours.reverse().map((hour) => (
                                                        <Button
                                                            key={hour}
                                                            size="icon"
                                                            variant={
                                                                date && date.getHours() % 12 === hour % 12
                                                                    ? "default"
                                                                    : "ghost"
                                                            }
                                                            className="sm:w-full shrink-0 aspect-square"
                                                            onClick={() => handleTimeChange("hour", hour.toString())}
                                                        >
                                                            {hour}
                                                        </Button>
                                                    ))}
                                                </div>
                                                <ScrollBar orientation="horizontal" className="sm:hidden" />
                                            </ScrollArea>
                                            <ScrollArea className="w-64 sm:w-auto">
                                                <div className="flex sm:flex-col p-2">
                                                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                                        <Button
                                                            key={minute}
                                                            size="icon"
                                                            variant={
                                                                date && date.getMinutes() === minute
                                                                    ? "default"
                                                                    : "ghost"
                                                            }
                                                            className="sm:w-full shrink-0 aspect-square"
                                                            onClick={() =>
                                                                handleTimeChange("minute", minute.toString())
                                                            }
                                                        >
                                                            {minute}
                                                        </Button>
                                                    ))}
                                                </div>
                                                <ScrollBar orientation="horizontal" className="sm:hidden" />
                                            </ScrollArea>
                                            <ScrollArea className="">
                                                <div className="flex sm:flex-col p-2">
                                                    {["AM", "PM"].map((ampm) => (
                                                        <Button
                                                            key={ampm}
                                                            size="icon"
                                                            variant={
                                                                date &&
                                                                    ((ampm === "AM" && date.getHours() < 12) ||
                                                                        (ampm === "PM" && date.getHours() >= 12))
                                                                    ? "default"
                                                                    : "ghost"
                                                            }
                                                            className="sm:w-full shrink-0 aspect-square"
                                                            onClick={() => handleTimeChange("ampm", ampm)}
                                                        >
                                                            {ampm}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <div>Appoinment Mode:
                                <Select value={appointmentMode} onValueChange={setAppointmentMode} >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Appointment Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Appointment Mode</SelectLabel>
                                            <SelectItem value="Offline">Offline</SelectItem>
                                            <SelectItem value="Online">Online</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => createAppointment({ subscriptionId: subscriptionId, date: date!, appointmentMode: appointmentMode })}>Create Appointment</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        }
    },
    {
        accessorFn: (row) => row.patient,
        accessorKey: "View Profile",
        header: ({ column }) => {
            return <div></div>
        },
        cell: ({ row }) => {
            const patient: Patient = row.getValue('View Profile')
            return (
                <div className="text-center w-full justify-center flex">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button >View Profile</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>View Profile</SheetTitle>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex justify-center items-center gap-4">
                                    <Avatar className="size-16">
                                        <AvatarImage src={patient.avatar} />
                                        <AvatarFallback>Avatar Image</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="text-center">
                                        Username: {patient.userName}
                                    </div>
                                </div>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="text-center">
                                        Email: {patient.email}
                                    </div>
                                </div>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="text-center">
                                        Mobile Number: {patient.mobileNo}
                                    </div>
                                </div>
                            </div>
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button >Remove Patient</Button>
                                </SheetClose>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>

            )

        }
    },
    {
        accessorFn: (row) => row.messages,
        accessorKey: "Chat Section",
        header: ({ column }) => {
            return <div></div>
        },
        cell: ({ row }) => {
            const patientName = row.getValue("userName") as string
            const patientEmail = row.getValue("email") as string
            const patient = row.getValue("View Profile") as Patient
            const [messageText, setMessageText] = useState("")
            const [messageArray, setMessageArray] = useState<Message[]>([])
            const [messageDocument,setMessageDocument] = useState<File |null>(null) 
            const doctor = row.getValue("doctor") as Patient

            const scroll_area: HTMLElement |null = document.getElementById("scroll_area")
            if(scroll_area){
                scroll_area!.scrollTop = scroll_area?.scrollHeight
            }


            const sendMessage = async () => {
                const session = await getSession()
                const userId = session?.user.id as string
                const role = session?.user.role as string

                const messageFormData = new FormData()
                const subscriptionId = row.getValue('subscriptionId') as string
                messageFormData.append('messageText', messageText)
                messageFormData.append('userId', userId)
                messageFormData.append('role', role)
                messageFormData.append('messageDocument', messageDocument as File)
                messageFormData.append("subscriptionId",subscriptionId)

                const messageData = Object.fromEntries(messageFormData.entries());

                socket.emit("createMessage", messageData);

                setMessageText("");
            }

            useEffect(() => {
                const handleConnect = async () => {
                    const subscriptionId = row.getValue('subscriptionId') as string
                    const data = { "subscriptionId": subscriptionId }
                    socket.emit("fetchMessage", data, (response: any) => {
                        setMessageArray(response.data.messages)
                    })
                }

                const handleNewMessage = (newMessage: any) => {
                    setMessageArray(prev => [...prev, newMessage]);
                }

                if (socket.connected) {
                    handleConnect()
                }
                else {
                    socket.on("connect", handleConnect)
                }


                socket.on("newMessage", handleNewMessage);

                return () => {
                    socket.off("connect", handleConnect);
                    socket.off("newMessage", handleNewMessage);
                };

            }, [sendMessage])
            return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">Chat Section</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="min-h-svh">
                        <AlertDialogCancel className="w-fit ">Cancel</AlertDialogCancel>
                        <AlertDialogHeader>
                            <AlertDialogTitle >
                                <p>Patient Name: {patientName}</p>
                                <p>Patient Email: {patientEmail}</p>
                            </AlertDialogTitle>
                            <AlertDialogDescription className="border-2 w-full">
                                <ScrollArea id="scroll_area" className="rounded-md border h-72 md:h-80">
                                    {
                                        messageArray?.length > 0 && messageArray.map((message) => (
                                            <div key={message.id} className={`w-full ${message.userId === patient.id ? "text-right" : "text-right"}`}>
                                                <div className={`bg-white border-2 ${message.userId === patient.id ? "justify-items-start" : "justify-items-end"} text-black`}>
                                                    <div className="font-semibold">{message.userId === patient.id ? patientName : doctor?.userName}</div>
                                                    <div>{message.messageText}</div>
                                                    {message.messageDocument && (
                                                        <a href={message.messageDocument}>Open the file</a>
                                                    )}
                                                </div>

                                            </div>
                                        ))
                                    }
                                </ScrollArea>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <div className="grid w-full gap-2">
                                <div className="flex">
                                    <Paperclip/>
                                    <Input type="file" onChange={(e) => {
                                        const files: FileList |null = e.target.files
                                        if(files){
                                            setMessageDocument(files[0])
                                        }

                                    }}/>
                                </div>

                                <Textarea value={messageText} placeholder="Type your message here." onChange={(e) => setMessageText(e.target.value)} />
                                <Button onClick={() => sendMessage()}>Send message</Button>
                            </div>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            )

        }
    },

]

export default function PatientRequestPending() {

    const [patientList, setPatientList] = useState<subscriptionRequests[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const getPendingRequest = async () => {
            setIsLoading(true)
            await axios.get('/api/subscription/getPendingRequest?isApprovedByDoctor=true')
                .then((response) => {
                    setPatientList(response.data.subscriptionsNotApprovedByDoctor)
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
        doctor: false
    })
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data: patientList,
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
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide() && column.id !== "subscriptionId" && column.id !== "doctor")
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

        </div>
    )
}