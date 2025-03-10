import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";



export async function GET(request: NextRequest){
    try {
        const sesssion = await getServerSession(authOptions)

        const {searchParams} = new URL(request.url)
        const isApprovedByDoctor =JSON.parse(searchParams.get('isApprovedByDoctor') as string)


        if(!sesssion?.user || sesssion.user.role!=="Doctor"){
            return NextResponse.json({
                success: false,
                message: "User is not Logged In"
            },{status:400})
        }
    
        const doctorId = sesssion.user.id
    
        const subscriptionsNotApprovedByDoctor  = await prisma.subscription.findMany({
            where:{
                doctorId: doctorId,
                isApprovedByDoctor: isApprovedByDoctor
            },
            include:{
                patient: {
                    omit:{
                        password: true
                    }
                }
            },
        })
        
    
        return NextResponse.json({
            success: true,
            message: "Pending Request Fetched Successfully",
            subscriptionsNotApprovedByDoctor: subscriptionsNotApprovedByDoctor
        },{status:200})
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Server error while fetching the request"
        },{status:500})
        
    }

    
}