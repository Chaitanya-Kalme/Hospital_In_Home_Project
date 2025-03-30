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
import { signIn } from "next-auth/react"
import { signInSchema } from "@/schema/patientSchema"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      role: "Patient"
    })
    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast.error("Login Failed", {
          description: "Incorrect Username or Password",
        })
      }
      else {
        toast.error("Error", {
          description: result.error,
        })
      }
    }
    else {
      toast.success("User Login Successfully")
      router.replace('/')
    }
    setLoading(false)
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
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Form {...form}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Login</CardTitle>
              <CardDescription className="text-center">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
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
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your Password" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                  </div>
                  <Button type="submit" disabled={loading}>Submit</Button>
                  <Button variant="outline" className="w-full">
                    Login with Google
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="/patient/sign-up" className="underline underline-offset-4">
                    Sign Up
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  )
}

export default SignInForm