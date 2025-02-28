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
import { signIn} from "next-auth/react"
import { signInSchema } from "@/schema/patientSchema"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function SignInForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
    


    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        setLoading(true)
        const result = await signIn('credentials',{
            redirect: false,
            email: data.email,
            password: data.password,
            role: "Patient"
        })
        if(result?.error){
            if(result.error ==='CredentialsSignin'){
                toast.error("Login Failed",{
                    description: "Incorrect Username or Password",
                })
            }
            else{
                toast.error("Error",{
                    description: result.error,
                })
            }
        }
        else{
            toast.success("User Login Successfully")
            router.replace('/')
        }
        setLoading(false)
    }

    const onError = (error: any) => {
        if (error) {
            Object.values(error).forEach((err: any) => {
                toast.error("Validation Error",{
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
            Sign In Form
          </h1>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
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
            <Button type="submit" disabled={loading}>Submit</Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/patient/sign-up" className="underline underline-offset-4">
                Sign Up
              </a>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default SignInForm