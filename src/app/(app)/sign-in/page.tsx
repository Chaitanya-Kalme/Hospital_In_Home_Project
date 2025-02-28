'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation"



function page() {
  const router = useRouter()
  return (
    <div className="flex flex-wrap gap-5 text-center justify-center  h-full">
      <Card>
        <CardHeader>
          <CardTitle>Doctor</CardTitle>
          <CardDescription>Sign in if you are a healthcare provider.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Access your dashboard to manage appointments, patient data, and more.</p>
        </CardContent>
          <Button onClick={() =>router.replace('/doctor/sign-in') }>SignIn</Button>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Patient</CardTitle>
          <CardDescription>Sign in if you are seeking healthcare.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Access your medical records, appointments, and communicate with your doctor.</p>
        </CardContent>
          <Button onClick={() =>router.replace('/patient/sign-in') }>SignIn</Button>
      </Card>
      
    </div>
  )
}

export default page