'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { signUpSchema } from "@/schema/doctorSchema"

export default function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [isShowing,setIsShowing] = useState(false)

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      mobileNo: "",
      specialites: "",
      documentForVerification: undefined
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
      formData.append('avatar',data.avatar)
      formData.append('specialites',data.specialites || "")
      const files= data.documentForVerification;
      for(let i= 0;i<files.length;i++){
        formData.append('documentForVerification',files[i]);
      }



      await axios.post('/api/doctor/sign-up', formData)
      .then((response) =>{
        if(response.status===200){
          toast.success(response.data.message)
          setIsShowing(true)
        }
        else{
          toast.error(response.data.message)
        }

      })

    } catch (error: any) {
      console.error(error)
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

  if(isShowing){
    return(
      <div className="text-center font-bold text-3xl">Your Profile Verification is in Progress, please login after 1-2 hours. </div>
    )
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
            <FormField
              control={form.control}
              name="specialites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialities</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter Your Specialities" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentForVerification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documents For Verification</FormLabel>
                  <FormControl>
                    <Input type="file" multiple onChange={(e) =>{
                      if(e.target.files){
                        field.onChange(e.target.files)
                      }
                    }}/>
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>Submit</Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/doctor/sign-in" className="underline underline-offset-4">
                Sign In
              </a>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
