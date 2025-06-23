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
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getSession } from 'next-auth/react';
import { AwardIcon, Paperclip } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';



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



function ChatSection({ params }: { params: { subscriptionId: string } }) {

    const [messageText, setMessageText] = useState("");
    const [messageArray, setMessageArray] = useState<Message[]>([]);
    const [messageDocument, setMessageDocument] = useState<File | null>(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [patient, setPatient] = useState<User>()
    const [doctor, setDoctor] = useState<User>()
    const router = useRouter()

    

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


    useEffect(() => {

        const handleConnect = async () => {
            const urlParams = await params
            const data = { "subscriptionId": urlParams.subscriptionId }
            socket.emit("fetchMessage", data, (response: any) => {
                setMessageArray(response.data.messages)
                setSubscriptionId(urlParams.subscriptionId)
                setPatient(response.data.patient)
                setDoctor(response.data.doctor)
                setIsLoading(false)
            })
        }

        const handleNewMessage= (newMessage: any) =>{
            setMessageArray(prev => [...prev,newMessage]);
        }

        if (socket.connected) {
            handleConnect()
        }
        else {
            socket.on("connect", handleConnect)
        }


        socket.on("newMessage",handleNewMessage);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("newMessage", handleNewMessage);
        };
    }, [sendMessage]);

    if (isLoading) {
        return (
            <div className='text-center text-2xl justify-center'>Loading...</div>
        )
    }

    return (
        <div>
            <div >
                <p>Patient Name: {patient?.userName}</p>
                <p>Patient Email: {patient?.email}</p>
            </div>
            <div className="border-2 w-full">
                <ScrollArea id="scroll_area" className="rounded-md border h-72 md:h-80">
                    {
                        messageArray?.length > 0 && messageArray?.map((message) => (
                            <div key={message.id} className={`w-full ${message.userId === patient?.id ? "text-right" : "text-right"}`}>
                                <div className={`bg-white border-2 ${message.userId === patient?.id ? "justify-items-start" : "justify-items-end"} text-black`}>
                                    <div className="font-semibold">{message.userId === patient?.id ? patient.userName : doctor?.userName}</div>
                                    <div>{message.messageText}</div>
                                    {message.messageDocument && (
                                        <a href={message.messageDocument}>Open the file</a>
                                    )}
                                </div>

                            </div>
                        ))
                    }
                </ScrollArea>
            </div>
            <div>
                <div className="grid w-full gap-2">
                    <div className="flex">
                        <Paperclip />
                        <Input type="file" onChange={(e) => {
                            const files: FileList | null = e.target.files
                            if (files) {
                                setMessageDocument(files[0])
                            }

                        }} />
                    </div>

                    <Textarea value={messageText} placeholder="Type your message here." onChange={(e) => setMessageText(e.target.value)} />
                    <Button onClick={() => sendMessage()}>Send message</Button>
                </div>
            </div>
        </div>
    );
};


export default ChatSection