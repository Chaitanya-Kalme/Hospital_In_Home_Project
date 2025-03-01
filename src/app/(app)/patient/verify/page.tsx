"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import axios from "axios"



const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

function VerifyUser() {
  const[loading,setLoading] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  })
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const router = useRouter()

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true)
    await axios.post('/api/patient/verifyCode',{
      email: email,
      token: data.pin
    })
    .then((response) =>{
      toast.success(response.data.message,{
        description: "Please Login Into Your Account"
      })
      router.replace('/')
    })
    .catch((error) =>{
      console.log(error)
      toast.error(error.response.data.message)
    })
    .finally(() => setLoading(false))
    


  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 text-center justify-center align-middle ">
        <h1 className="font-bold text-2xl">Verify Your Account To Login and Access Your Profile</h1>
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field} pattern={REGEXP_ONLY_DIGITS}>
                  <InputOTPGroup className="w-full text-center justify-center ">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the one-time password sent to your Email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>Submit</Button>
      </form>
    </Form>
  )
}


export default VerifyUser