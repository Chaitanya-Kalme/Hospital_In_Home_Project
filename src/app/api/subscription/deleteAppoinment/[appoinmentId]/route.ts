import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(request: NextRequest,{params}:{params: {appoinmentId: string}}){
    try {
        const urlParams= await params
    
        const appoinmentId = params.appoinmentId
    
        if(!appoinmentId){
            return NextResponse.json({
                success: false,
                message: "Appoinment Id is required"
            },{status: 404})
        }
    
        await prisma.appointment.delete({
            where:{
                id: appoinmentId
            }
        })
    
        return NextResponse.json({
            success: true,
            message: "Appoinment Deleted Successfully"
        },{status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            success: false,
            message: "Error while deleting appoinment"
        },{status: 500})
        
    }
}