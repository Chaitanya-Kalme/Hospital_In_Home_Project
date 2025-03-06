'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
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



interface User {
    userName: string,
    email: string,
    avatar: string,
    mobileNo: string,
    createdAt: Date,
    updatedAt: Date,
    specialites: string,
}

function ProfilePage() {

    const { data: session } = useSession()
    const [fetchedUser, setFetchedUser] = useState<User | null>(null)
    const [isLoading,setIsLoading] = useState(false)
    const [avatarFile,setAvatarFile] = useState<FileList | null>(null)
    const router = useRouter()

    useEffect(() => {
        async function getUser() {
            const user = session?.user
            if (user) {
                await axios.get('/api/doctor/profile')
                    .then((response) => {
                        if (response.status === 200) {
                            setFetchedUser(response.data.doctor)
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
        getUser()
    }, [session])

    if (!fetchedUser) {
        return (
            <div className="text-2xl font-bold text-center justify-center">Please Login to Access Your Profile</div>
        )
    }
    function updateAvatarFile(){
        setIsLoading(true)
        if(avatarFile===null){
            toast.error("Avatar file is required")
        }
        else{
            const formData = new FormData()
            formData.append('avatar',avatarFile[0])
            axios.post('/api/doctor/updateAvatar',formData)
            .then((response) =>{
                console.log(response)
                toast.success(response.data.message)
                router.refresh()
            })
            .catch((error) =>{
                console.log(error)
                toast.error(error.message)
            })
        }
        setIsLoading(false)
    }

    function removeAvatarFile(){
        setIsLoading(true)
        axios.delete('/api/doctor/updateAvatar')
        .then((response) =>{
            console.log(response)
            toast.success(response.data.message)
            router.refresh()
        })
        .catch((error) =>{
            console.log(error)
            toast.error(error.data.message)
        })
        .finally(() =>{
            setIsLoading(false)
        })
    }

    return (
        <>
            <div className="text-4xl font-bold font-serif italic underline text-center p-2">Doctor Profile</div>
            <div className="flex gap-x-5 p-3 text-center justify-center">
                <div className="size-56">
                    <Avatar className="size-56 rounded-3xl">
                        <AvatarImage src={`${fetchedUser.avatar}`} />
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
                                        <Label  className="text-right">
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
                    {fetchedUser.specialites && (
                        <div>Specialites: {fetchedUser.specialites}</div>
                    )}
                    <div>Account Created At: {new Date(fetchedUser.createdAt).toDateString()} {new Date(fetchedUser.createdAt).toLocaleTimeString()}</div>

                </div>
            </div>
        </>
    )
}

export default ProfilePage