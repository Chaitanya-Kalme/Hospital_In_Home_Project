import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"


export const sendEmail = async({email,emailType,userId}:any) =>{
    try {
        const token = (Math.floor(100000 + Math.random()*999999)).toString()
        let patient;
        if(emailType==="VERIFY"){
            patient = await prisma.patient.update({
                where: {
                    id: userId.toString()
                },
                data:{
                    verificationCode: token,
                    verificationCodeExpiry: new Date(Date.now() + 3600000)
                }
            })
        }
        else if(emailType==="RESET"){
            patient = await prisma.patient.update({
                where: {
                    id: userId.toString()
                },
                data:{
                    verificationCode: token,
                    verificationCodeExpiry: new Date(Date.now() + 3600000)
                }
            })
        }
        else {
            return NextResponse.json({
                success: false,
                message: "Email type must be VERIFY or RESET"
            },{status:400})
        }

        // Email Send Logic

        return NextResponse.json({
            success: true,
            message: "Email send successfully"
        },{status:200})



    } catch (error) {
        console.error(error)
        return NextResponse.json({
            success: false,
            messsage: "Something went wrong while sending the email",
        },{status:500})
    }

}