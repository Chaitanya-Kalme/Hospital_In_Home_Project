
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(request: NextRequest, {params}: {params:{doctorId: string}}){
    const searchParams = await params

    const doctorId = searchParams.doctorId;
    if(!doctorId){
        return NextResponse.json({
            success: false,
            message: "Doctor Id is required"
        },{status: 404})
    }

    const doctor = await prisma.doctor.update({
        where:{
            id: doctorId
        },
        data:{
            isVerified: true
        }
    })

    // Email send

    return NextResponse.json({
        success: true,
        message: "Doctor request approved"
    },{status: 200})

}