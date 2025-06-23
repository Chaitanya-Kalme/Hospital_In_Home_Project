"use client"
import socket from '@/helper/useSocket'
import { useEffect, useState } from 'react';
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
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { getSession } from 'next-auth/react';
import { Paperclip } from 'lucide-react';



enum AppointmentMode {
    Offline,
    Online
}

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


type Appointment = {
    id: string,
    appointmentDateAndTime: Date,
    mode: AppointmentMode,
    meetingLink: string,
    subscription: subscriptionRequests
}



const ChatModal = ({ patient, doctor, subscriptionId, patientName, patientEmail }: {
    patient: User;
    doctor: User;
    subscriptionId: string;
    patientName: string;
    patientEmail: string;
}) => {
    const [messageText, setMessageText] = useState("");
    const [messageArray, setMessageArray] = useState<Message[]>([]);
    const [messageDocument, setMessageDocument] = useState<File | null>(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    useEffect(() => {
        const handleConnect = () => {
            setIsSocketConnected(true);
            console.log("Entered")
            socket.emit("fetchMessage", { subscriptionId }, (response: any) => {
                setMessageArray(response.messageArray);
            });
        };

        if (socket.connected) {
            handleConnect();
        } else {
            socket.on("connect", handleConnect);
        }

        socket.on("newMessage", (newMessage: Message) => {
            setMessageArray((prev) => [...prev, newMessage]);
        });

        return () => {
            socket.off("connect", handleConnect);
            socket.off("newMessage");
            socket.disconnect();
        };
    }, [subscriptionId]);

    const sendMessage = async () => {
        if (!socket.connected) console.warn("Socket io is not connected");

        const session = await getSession();
        const userId = session?.user.id as string;
        const role = session?.user.role as string;

        const formData = new FormData();
        formData.append("messageText", messageText);
        formData.append("userId", userId);
        formData.append("role", role);
        formData.append("subscriptionId", subscriptionId);
        // if (messageDocument) formData.append("messageDocument", messageDocument);

        const messageData = Object.fromEntries(formData.entries());

        socket.emit("createMessage", messageData, (response: any) => {
            console.log(response);
        });

        setMessageText("");
    };

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
    );
};

export default ChatModal