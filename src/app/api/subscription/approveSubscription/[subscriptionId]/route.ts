import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function PATCH(request: NextRequest,{params}:{params: {subscriptionId: string}}){
    try {

        const subscriptionId = params.subscriptionId
    
        if(!subscriptionId){
            return NextResponse.json({
                success: false,
                message: "Subcription Id is required",
            },{status:404})
        }
    
        const session = await getServerSession(authOptions)
    
        const user = session?.user
    
        if(!user || user.role!=="Doctor"){
            return NextResponse.json({
                success: false,
                message: "User is not logged in"
            },{status:400})
        }
    
        const subscription = await prisma.subscription.findFirst({
            where:{
                id: subscriptionId
            }
        })
    
        if(!subscriptionId){
            return NextResponse.json({
                success: false,
                message: "Subcription Does not exist"
            },{status:404})
        }
    
        const updatedSubcription = await prisma.subscription.update({
            where:{
                id: subscriptionId
            },
            data:{
                isApprovedByDoctor: true
            }
        })
    
        if(!updatedSubcription){
            return NextResponse.json({
                success: false,
                messsgae: "Server error while updating the subscription",
            },{status:500})
        }
    
    
        return NextResponse.json({
            success: false,
            message: "Subscription Approved"
        },{status:200})
    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Server error while changing the approval "
        },{status:500})
        
    }
}