import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";


export async function POST(request: NextRequest){
    const session = await getServerSession(authOptions)
    const user = session?.user
    if(!user && session?.user.role!=="Patient"){
        return NextResponse.json({
            success: false,
            message: "Patient is not logged in",
        },{status:400})
    }

    const {doctorId,detailsAboutProblem}= await request.json();
    if(!doctorId || !detailsAboutProblem){
        return NextResponse.json({
            success: false,
            message: "All Fields are required",
        },{status:404})
    }
    
    const doctor = await prisma.doctor.findFirst({
        where: {
            id: doctorId.toString()
        },
        omit:{
            password:true
        }
    })
    
    if(!doctor || !doctor.isVerified){
        return NextResponse.json({
            success: false,
            message:"Doctor Does not Exist"
        },{status: 400})
    }

    const patient = await prisma.patient.findFirst({
        where: {
            id: session.user.id
        },
        omit:{
            password:true
        }
    })

    if(!patient){
        return NextResponse.json({
            success: false,
            message:"Patient Does not exist"
        },{status: 400})
    }

    const checkSubscriptionExist= await prisma.subscription.findFirst({
        where:{
            AND:{
                doctorId: doctorId,
                patientId: patient.id
            }
        }
    })

    if(checkSubscriptionExist){
        return NextResponse.json({
            success: false,
            message: "Connection Request Already Exist"
        },{status:400})
    }


    const subscription = await prisma.subscription.create({
        data:{
            detailsAboutProblem: detailsAboutProblem,
            doctorId: doctorId,
            patientId: patient.id
        }
    })

    if(!subscription){
        return NextResponse.json({
            success: false,
            message: "Failed to send the request"
        },{status: 500})
    }

    return NextResponse.json({
        success: true,
        message: "Request Send Successfully"
    },{status: 200})
}