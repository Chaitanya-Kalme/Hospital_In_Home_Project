'use client'
import { SubscriptionFormSchema } from "@/schema/subscriptionFormSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"



export default function SendRequestToDoctor({ params }: { params: { doctorId: string } }) {
  const [loading, setLoading] = useState(false)
  const [doctorId, setDoctorId] = useState("")
  const router = useRouter()
  const { data: session } = useSession()




  const form = useForm<z.infer<typeof SubscriptionFormSchema>>({
    resolver: zodResolver(SubscriptionFormSchema),
    defaultValues: {
      doctorId: doctorId,
      detailsAboutProblem: ""
    }
  })

  useEffect(() => {
    const fetchDoctorId = async () => {
      const resolveParams = await params
      setDoctorId(resolveParams.doctorId)
    }
    fetchDoctorId()
  }, [params])

  const onSubmit = async (data: z.infer<typeof SubscriptionFormSchema>) => {
    await axios.post('/api/subscription/createSubscription', { doctorId: doctorId, detailsAboutProblem: data.detailsAboutProblem })
      .then((response) => {
        console.log(response.data.message)
        toast.success(response.data.message)
        router.refresh()
      })
      .catch((error) => {
        console.log(error)
        toast.error(error.response.data.message)
      })
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

  if (!session?.user) {
    return (
      <div className="text-center font-bold text-2xl p-4">Please Login to Send the Request to the Doctor</div>
    )
  }

  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Form {...form}>
          <h1 className="font-bold text-center text-2xl">
            Consultancy Request Form
          </h1>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8 p-5">
            <FormField
              control={form.control}
              name="detailsAboutProblem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details About Problem</FormLabel>
                  <FormControl>
                    <Input placeholder="Details" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="text-center">
              <Button type="submit" disabled={loading} className=" justify-center">Submit</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}