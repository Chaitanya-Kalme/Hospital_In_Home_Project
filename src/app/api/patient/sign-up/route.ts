import prisma from "@/lib/prisma";
import { signUpSchema } from "@/schema/patientSchema";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import { sendEmail } from "@/helper/sendEmail";


export async function POST(req: NextRequest){
    try {
        const userForm = (await req.formData())
        const userName = userForm.get('userName') as string
        const email = userForm.get('email') as string
        const password = userForm.get('password') as string
        const avatar = userForm.get('avatar')  as File|| null
        const mobileNo = userForm.get('mobileNo') as string
        const avatarFileName = avatar?.name as string

        if(!userName && !email && !password && !mobileNo){
            return NextResponse.json({
                success: false,
                message: "All Fields are required"
            },{status:404})
        }

        const patient = await prisma.patient.findFirst({
            where: {
                email: email
            }
        })

        if(patient){
            return NextResponse.json({
                success: false,
                message: "User Already Exist with this email",
            },{status:400})
        }

        const hashedPassword= await bcrypt.hash(password,10)

        const createdPatient = await prisma.patient.create({
            data:{
                userName: userName,
                email: email,
                password: hashedPassword,
                avatar: avatarFileName,
                mobileNo: mobileNo,
            }
        })

        if(!createdPatient){
            return NextResponse.json({
                success: false,
                message: "Server Error while creating the user"
            },{status:500})
        }

        await sendEmail({email: createdPatient.email,emailType:"VERIFY",userId: createdPatient.id})

        const userToSend = await prisma.patient.findFirst({
            where:{
                id: createdPatient.id
            }
        })

        return NextResponse.json({
            success: true,
            message: "User Created Successfully",
            user: userToSend
        },{status:200})

        
    } catch (error:any) {
        console.log(error.message)
        return NextResponse.json({
            success: false,
            message: "Something went wrong while creating the user"
        },{status:500})
        
    }
}