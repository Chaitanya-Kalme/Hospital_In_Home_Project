import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest){
    try {
        const {searchParams} = new URL(request.url)
        const patientId= searchParams.get('patientId')
    
        const patient= await prisma.patient.findFirst({
            where: {
                id: patientId?.toString()
            },
            omit:{
                password:true
            },
            include:{
                subscriptions: {
                    include:{
                        doctor: {
                            omit:{
                                password: true
                            }
                        },
                        patient: {
                            omit:{
                                password: true
                            }
                        },
                        messages:true
                    }
                }
            }
        })
    
        if(!patient ){
            return NextResponse.json({
                success: false,
                message: "Patient Does not Exist",
            },{status:400})
        }

        if(!patient.isVerified){
            return NextResponse.json({
                success: false,
                message: "Patient is not Verified",
            },{status:400})
        }
    
    
        return NextResponse.json({
            success: true,
            message: "Patient Profile Fetched Successfully",
            patient: patient
        },{status:200})


    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Server Error while fetching the patient profile"
        },{status:500})
    }
}