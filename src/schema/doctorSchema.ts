import {z} from "zod"


export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5,"Password must be atleast of 5 characters")
})


export const signUpSchema = z.object({
    userName: z.string().min(4,"Username must be 4 characters long").max(20,"Username must be less than 20 characters"),
    email: z.string().email(),
    password: z.string().min(5,"Password must be atleast of 5 characters"),
    mobileNo: z.string().length(10,"Mobile Number must be 10 digits Long"),
    avatar: z.instanceof(File).refine((file) =>['image/jpeg','image/png','image/jpg'].includes(file.type),{
        message: "Only JPG or PNG or JPEG file are allowed"
    }),
    specialites: z.string().optional(),
    documentForVerification: z.instanceof(FileList)
})