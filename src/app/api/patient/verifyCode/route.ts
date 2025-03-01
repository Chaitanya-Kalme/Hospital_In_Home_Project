import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        const { email,token} = await request.json()

        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Token is Required"
            }, { status: 404 })
        }

        const patient = await prisma.patient.findFirst({
            where: {
                email: email
            }
        })
        if (!patient) {
            return NextResponse.json({
                success: false,
                message: "Patient Does not Exist",
            }, { status: 400 })
        }

        if(patient?.verificationCode !==token){
            return NextResponse.json({
                success: false,
                message: "Verification Code is not Correct",
            },{status:400})
        }

        if (patient?.verificationCodeExpiry && patient.verificationCodeExpiry < new Date(Date.now())) {
            return NextResponse.json({
                success: false,
                message: "Verification Code is Expired Please generate new verification code"
            },{status:400})
        }


        const updatedPatient = await prisma.patient.update({
            where:{
                id: patient.id
            },
            data:{
                isVerified: true,
                verificationCode: null,
                verificationCodeExpiry: null
            }
        })

        if(!updatedPatient){
            return NextResponse.json({
                success: false,
                message: "Something went wrong while updating the user"
            },{status:400})
        }

        return NextResponse.json({
            success: true,
            message: "User Verified Successfully",
        },{status:200})

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: "Server error while verification"
        }, { status: 500 })
    }
}