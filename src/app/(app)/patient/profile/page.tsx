'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import axios from "axios"
import { getSession, useSession } from "next-auth/react"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { ArrowUpDown, ChevronDown, Paperclip, } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@radix-ui/react-dropdown-menu"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message{
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
    specialities: string
}


export const columns: ColumnDef<subscriptionRequests>[] = [
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
        accessorFn: (row) => row.doctor?.userName,
        accessorKey: "userName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Doctor Name
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
        accessorFn: (row) => row.doctor?.email,
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Doctor's Email
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
        accessorFn: (row) => row.patient,
        accessorKey: "patient",
        enableHiding: true,
    },
    {
        accessorFn: (row) => row.doctor,
        accessorKey: "View Profile",
        header: ({ column }) => {
            return <div></div>
        },
        cell: ({ row }) => {
            const doctor: User = row.getValue('View Profile')
            return (
                <div className="text-center w-full justify-center flex">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">View Doctor's Profile</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Profile</SheetTitle>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex justify-center items-center gap-4">
                                    <Avatar className="size-16">
                                        <AvatarImage src={doctor.avatar} />
                                        <AvatarFallback>Avatar Image</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="text-center">
                                        Username: {doctor.userName}
                                    </div>
                                </div>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="text-center">
                                        Email: {doctor.email}
                                    </div>
                                </div>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="text-center">
                                        Mobile Number: {doctor.mobileNo}
                                    </div>
                                </div>
                            </div>
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
            const doctorName = row.getValue("userName") as string
            const doctorEmail = row.getValue("email") as string
            const doctor = row.getValue("View Profile") as User
            const [messageText,setMessageText] = useState("")
            const [messageArray,setMessageArray] = useState<Message[]>([])
            const [messageDocument,setMessageDocument] = useState<File |null>(null)
            const patient = row.getValue("patient") as User
            useEffect(() =>{
                const messages:Message[] = row.getValue('Chat Section')
                setMessageArray(messages)
            },[messageArray])

            setTimeout(async () => {
                const messages:Message[] = row.getValue('Chat Section')
                setMessageArray(messages)
            }, 1000);
            const subscriptionId = row.getValue('subscriptionId') as string
            
            
            const sendMessage = async () =>{
                const session  =  await getSession()
                const userId = session?.user.id as string
                const role = session?.user.role as string

                const messageFormData = new FormData()
                messageFormData.append('messageText',messageText)
                messageFormData.append('userId',userId)
                messageFormData.append('role',role)
                messageFormData.append('messageDocument',messageDocument as File)
                
                await axios.post(`/api/message/createMessage/${subscriptionId}`,messageFormData)
                .then((response) =>{
                    toast.success("Message send sucessfully")
                })
                .catch((error) =>{
                    console.log(error)
                    toast.error(error.message)
                })
                setMessageText("")
            }

            return (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">Chat Section</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="min-h-svh overflow-scroll">
                            <AlertDialogCancel className="w-fit ">Cancel</AlertDialogCancel>
                            <AlertDialogHeader>
                                <AlertDialogTitle >
                                    <p>Doctor Name: {doctorName}</p>
                                    <p>Doctor Email: {doctorEmail}</p>
                                </AlertDialogTitle>
                                <AlertDialogDescription className="border-2 w-full overflow-y-auto">
                                <ScrollArea id="scroll_area" className="rounded-md border h-72 md:h-80">
                                    {
                                        messageArray?.length>0 &&  messageArray.map((message) =>(
                                            <div key={message.id} className={`w-full ${message.userId === doctor.id ? "text-right" : "text-right"}`}>
                                            <div className={`bg-white border-2 ${message.userId === doctor.id ? "justify-items-start" : "justify-items-end"} text-black`}>
                                                <div className="font-semibold">{message.userId === doctor.id ? doctorName : patient?.userName}</div>
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

function ProfilePage() {

    const { data: session } = useSession()
    const [fetchedUser, setFetchedUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [avatarFile, setAvatarFile] = useState<FileList | null>(null)
    const [subscriptionList, setSubscriptionList] = useState<subscriptionRequests[]>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        subscriptionId: false,
        patient: false
    })
    const [rowSelection, setRowSelection] = useState({})
    const router = useRouter()

    const table = useReactTable({
        data: subscriptionList,
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

    useEffect(() => {
        async function getUser() {
            const user = session?.user
            if (user) {
                await axios.get(`/api/patient/getPatient?patientId=${session.user.id}`)
                    .then((response) => {
                        if (response.status === 200) {
                            setFetchedUser(response.data.patient)
                            setSubscriptionList(response.data.patient.subscriptions)
                            toast.success(response.data.message)
                        }
                        else {
                            toast.error(response.data.message)
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                        toast.error(error.message)
                    })
            }
        }
        setIsLoading(true)
        getUser()
        setIsLoading(false)
    }, [session])


    function updateAvatarFile() {
        setIsLoading(true)
        if (avatarFile === null) {
            toast.error("Avatar file is required")
        }
        else {
            const formData = new FormData()
            formData.append('avatar', avatarFile[0])
            axios.post('/api/patient/updateAvatar', formData)
                .then((response) => {
                    console.log(response)
                    toast.success(response.data.message)
                    router.refresh()
                })
                .catch((error) => {
                    console.log(error)
                    toast.error(error.message)
                })
        }
        setIsLoading(false)
    }

    function removeAvatarFile() {
        setIsLoading(true)
        axios.delete('/api/patient/updateAvatar')
            .then((response) => {
                console.log(response)
                toast.success(response.data.message)
                router.refresh()
            })
            .catch((error) => {
                console.log(error)
                toast.error(error.data.message)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }






    if (isLoading) {
        return (
            <div className="text-center justify-center">Loading...</div>
        )
    }

    if (!fetchedUser) {
        return (
            <div className="text-2xl font-bold text-center justify-center">Please Login to Access Your Profile</div>
        )
    }

    return (
        <>
            <div className="text-4xl font-bold font-serif italic underline text-center p-2">Patient Profile</div>
            <div className="flex gap-x-5 p-3 text-center justify-center">
                <div className="size-56">
                    <Avatar className="size-56 rounded-3xl">
                        <AvatarImage src={`${fetchedUser.avatar}`} className="rounded-3xl" />
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Update Avatar</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Avatar</DialogTitle>
                                    <DialogDescription>
                                        Upload Your Avatar File here. Click save when you're done.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">
                                            Avatar File:
                                        </Label>
                                        <Input type="file" onChange={(e) => setAvatarFile(e.target?.files)} className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isLoading} onClick={updateAvatarFile}>Save changes</Button>
                                </DialogFooter>
                                <Button type="submit" disabled={isLoading} onClick={removeAvatarFile}>Remove Avatar</Button>
                            </DialogContent>
                        </Dialog>
                        <AvatarFallback>HIH</AvatarFallback>
                    </Avatar>

                </div>
                <div className="text-xl text-center space-y-2">
                    <div>UserName: {fetchedUser.userName}</div>
                    <div>Email: {fetchedUser.email}</div>
                    <div>Mobile Number: {fetchedUser.mobileNo}</div>
                    <div>Account Created At: {new Date(fetchedUser.createdAt).toDateString()} {new Date(fetchedUser.createdAt).toLocaleTimeString()}</div>
                </div>
            </div>
            <div>
                <div className="w-full p-4">
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
                                    .filter((column) => column.getCanHide() && column.id !== "subscriptionId" && column.id!=="patient")
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
            </div>
        </>
    )
}

export default ProfilePage