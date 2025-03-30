'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'


interface Doctor{
    id: string,
    userName: string,
    email: string,
    avatar: string,
    specialities: string,
    mobileNo: string,
}


export default function ConsultDoctors() {
    const [loading, setLoading] = useState(false)
    const [doctorList, setDoctorList] = useState<Doctor[]>([])
    const {data: session} = useSession()
    const router = useRouter()

    useEffect(() => {
        setLoading(true)
        const getDoctorList = async () => {
            await axios.get('/api/doctor/getDoctor?type=All')
                .then((response) => {
                    setDoctorList(response.data.doctors)

                })
                .catch((error) => {
                    console.log(error)
                    toast.error(error.response.data.message)
                })
        }
        getDoctorList()
        setLoading(false)
    }, [])

    if (loading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <div className='text-center flex flex-wrap justify-center'>
            {
                doctorList.map((doctor) =>(
                    <Card className='m-2'>
                        <CardHeader>
                            <CardTitle>Name: {doctor.userName}</CardTitle>
                            <CardDescription>Email: {doctor.email}</CardDescription>
                            <CardDescription>Mobile Number: {doctor.mobileNo}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <img src={doctor.avatar} alt="Doctor Avatar" />
                        </CardContent>
                        <CardFooter className='text-center justify-center'>
                            <p>{doctor?.specialities}</p>
                            <Button className='text-center justify-center flex flex-wrap' onClick={() => router.replace(`/consultancy/sendRequest/${doctor.id}`)}>Send Request</Button>
                        </CardFooter>
                    </Card>
                ))
            }

        </div>
    )
}