'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { signUpSchema } from "@/schema/patientSchema"
import { z } from "zod"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      mobileNo: "",
    },
  })

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('userName',data.userName)
      formData.append('email',data.email)
      formData.append('password',data.password)
      formData.append('mobileNo',data.mobileNo)
      if(data.avatar){
        formData.append('avatar',data.avatar)
      }


      const response = await axios.post('/api/patient/sign-up', formData)
      toast.success(response.data.message)
      router.replace(`/patient/verify?email=${data.email}`)
    } catch (error: any) {
      console.error("Error in signup of user", error)
      toast.error("Sign up failed", {
        description: error.response.data.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const onError = (error: any) => {
    if (error) {
      Object.values(error).forEach((err: any) => {
        toast.error("Validation Error", {
          description: err.message,
        })
      });
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Form {...form}>
          <h1 className="font-bold text-center text-2xl">
            Sign Up Form
          </h1>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Username" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your Password" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter your Mobile Number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar File</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={(e) =>{
                      if(e.target.files){
                        field.onChange(e.target.files[0])
                      }
                    }}/>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>Submit</Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/patient/sign-in" className="underline underline-offset-4">
                Sign In
              </a>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
