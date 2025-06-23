import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest){
    const {searchParams} = new URL(request.url)
    const subscriptionId= searchParams.get("subscriptionId")

    if(!subscriptionId){
        return NextResponse.json({
            success: false,
            message: "Subscription Id is required"
        },{status:404})
    }

    const subscription = await prisma.subscription.findFirst({
        where:{
            id: subscriptionId
        },
        include:{
            doctor: true,
            patient: true,
            messages: true
        }
    })


    return NextResponse.json({
        success: true,
        message: "Subscription Fetched Successsfully",
        data: subscription
    },{status:200})

}