import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        const doctorData = await request.formData()
        const userName = doctorData.get('userName') as string
        const email = doctorData.get('email') as string
        const password = doctorData.get('password') as string
        const avatar = doctorData.get('avatar') as File 
        const mobileNo = doctorData.get('mobileNo') as string
        const specialites = doctorData.get('specialites') as string
        const documentForVerification= doctorData.getAll('documentForVerification') as any
        const avatarFileName = avatar?.name as string
    
        if(!userName && !email && !password && !avatar && !mobileNo && !documentForVerification){
            return NextResponse.json({
                success: false,
                message: "All Fields are required",
            },{status:404})
        }
    
        const isDoctorAccountExist = await prisma.doctor.findFirst({
            where: {
                email: email
            }
        })
    
        if(isDoctorAccountExist){
            return NextResponse.json({
                message: false,
                success: "User Account Already Exist"
            },{status:400})
        }
    
        const doctor= await prisma.doctor.create({
            data:{
                userName,
                email,
                password,
                avatar: avatarFileName,
                mobileNo,
                documentForVerification: documentForVerification, 
                specialites
            }
        })
    
        if(!doctor){
            return NextResponse.json({
                success: false,
                message: "Error while creating the account"
            },{status:500})
        }
    
        return NextResponse.json({
            success: true,
            message: "User Account Created Successfully"
        },{status:200})
    } catch (error:any) {
        console.log(error.message)

        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        },{status: 500})
    }
}