import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest, {params}:{params: {doctorId:string}}){
    try {
        const urlParams = await params
        const doctorId=  urlParams.doctorId
    
        if(!doctorId){
            return NextResponse.json({
                success: false,
                message: "Doctor Id is required",
            },{status: 404})
        }
    
        const presentDateAndTime= new Date()
        const appointments = await prisma.appointment.findMany({
            where:{
                doctorId: doctorId,
                appointmentDateAndTime: {
                    gte: presentDateAndTime
                }
            },
            include:{
                subscription:{
                    include:{
                        patient: true,
                        messages: true
                    }
                },
                
            },
            orderBy:{
                appointmentDateAndTime: 'asc'
            }
        })
    
        return NextResponse.json({
            success: true,
            message: "Appointments Fetched successfully",
            appointments
        },{status: 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: "Something went wrong while fetching appoinments"
        },{status: 500})
        
    }



}