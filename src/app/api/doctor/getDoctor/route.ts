import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest){
    try {
        const {searchParams}= new URL(request.url)
    
        const id = searchParams.get('doctorId')
        const type = searchParams.get('type')
    
        console.log(searchParams)

        if(!type && !id){
            return NextResponse.json({
                success: false,
                message: "Type or Id is required in query"
            },{status:404})
        }
    
    
        if(type==="All"){
            const doctors = await prisma.doctor.findMany()
    
            return NextResponse.json({
                success: true,
                message: "Doctor fetched successfully",
                doctors: doctors
            },{status:200})
        }
    
        else if(id){
            const doctor = await prisma.doctor.findFirst({
                where:{
                    id: id
                },
                omit:{
                    password:true
                }
            })
            return NextResponse.json({
                success: true,
                message:"Doctor fetched successfully",
                doctor: doctor
            },{status:200})
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message:"Server error while fetching the doctor profile"
        },{status:500})
    }
}