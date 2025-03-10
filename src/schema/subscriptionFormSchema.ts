import { z } from "zod";


export const SubscriptionFormSchema = z.object({
    doctorId: z.string(),
    detailsAboutProblem: z.string().min(5,"Details must be atleast 5 characters long")
})