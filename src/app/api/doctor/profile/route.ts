import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";



export async function GET(){
    const session = await getServerSession(authOptions)

    const userId = session?.user.id

    try {
        if(!userId){
            return NextResponse.json({
                success: false,
                message: "User is not logged In"
            },{status:400})
        }
    
        const doctor= await prisma.doctor.findFirst({
            where:{
                id: userId
            },
            omit:{
                password:true
            }
        })
    
        if(!doctor){
            return NextResponse.json({
                success: false,
                message: "User does not exist",
            },{status:400})
        }
    
        return NextResponse.json({
            success: true,
            message: "User profile fetched successfully",
            doctor: doctor
        },{status:200})
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message,
        },{status:500})
        
    }
}