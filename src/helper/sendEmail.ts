import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"


export const sendEmail = async({email,emailType,userId}:any) =>{
    try {
        const hashedToken = await bcrypt.hash(userId.toString(),10)
        let patient;
        if(emailType==="VERIFY"){
            patient = await prisma.patient.update({
                where: {
                    id: userId.toString()
                },
                data:{
                    verificationCode: hashedToken,
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
                    verificationCode: hashedToken,
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