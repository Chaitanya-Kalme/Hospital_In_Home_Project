import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/helper/sendEmail";



export async function POST(request: NextRequest,{params}:{params: {subscriptionId: string}}){
    try {
        const session = await getServerSession(authOptions)
    
        const user = session?.user
    
        if(!user && session?.user.role!=="Doctor"){
            return NextResponse.json({
                success: false,
                message:"User is not logged in"
            },{status:400})
        }
    
        const doctor = await prisma.doctor.findFirst({
            where:{
                id: session.user.id
            }
        })
    
        if(!doctor){
            return NextResponse.json({
                success: false,
                message: "Doctor Account does not exist"
            },{status:404})
        }
    
        const urlparams = await params
        const subscriptionId = urlparams.subscriptionId
    
        if(!subscriptionId){
            return NextResponse.json({
                success: false,
                messsge: "Subscription Id is required"
            },{status:404})
        }
    
    
        const subscription = await prisma.subscription.findFirst({
            where:{
                id: subscriptionId
            }
        })
    
        if(!subscription || !subscription.isApprovedByDoctor){
            return NextResponse.json({
                success: false,
                message: "Subscription does not exist"
            },{status: 400})
        }
    
        const appointmentDataForm = await request.formData()
        const dateAndTime = appointmentDataForm.get('appointmentDateAndTime') as string
        const appointmentMode = appointmentDataForm.get('appointmentMode') as string
        let meetingLink
        if(appointmentMode==="Online"){
            meetingLink = "meeting link"
        }


        const formatedDateAndTime = new Date(dateAndTime)
        const appointmentDateAndTime = formatedDateAndTime.toISOString()

        if(!appointmentDateAndTime && !appointmentMode){
            return NextResponse.json({
                success: false,
                message: "All Fields are required"
            },{status:404})
        }
    
        if(appointmentMode==="Online" && meetingLink===null){
            return NextResponse.json({
                success: false,
                message: "Meeting Link is required in case of Online Meeting"
            },{status:404})
        }
    
        const patientId = subscription.patientId;
        const patient = await prisma.patient.findFirst({
            where:{
                id: patientId
            }
        })
    
        if(!patient){
            return NextResponse.json({
                success: false,
                message: "Patient Does not exist"
            },{status:404})
        }

        const checkAppointmentExist = await prisma.appointment.findFirst({
            where:{
                subscriptionId: subscriptionId,
                appointmentDateAndTime: appointmentDateAndTime
            }
        })

        if(checkAppointmentExist){
            return NextResponse.json({
                success: false,
                message: "Appointment Already Exist with this user at that time"
            },{status:400})
        }
    
        const appointment = await prisma.appointment.create({
            data:{
                doctorId: doctor.id,
                patientId: patient.id,
                appointmentDateAndTime: appointmentDateAndTime,
                mode: appointmentMode==="Online"? "Online" : "Offline",
                subscriptionId: subscriptionId,
                meetingLink: meetingLink
            },
            include:{
                subscription:{
                    include:{
                        doctor:{
                            omit:{
                                password: true
                            }
                        },
                        patient:{
                            omit:{
                                password: true
                            }
                        }
                    }
                }
            }
        })
    
        if(!appointment){
            return NextResponse.json({
                success: false,
                message: "Error while creating the appointment"
            },{status:500})
        }
    
        const emailResponse = await sendEmail({email: patient?.email, emailType: "Appointment",userId: patient?.id})
    
        return NextResponse.json({
            success: true,
            message: "Appointment Created Successfully",
            appointment: appointment
        },{status:200})
    } catch (error:any) {
        console.log(error.message)
        return NextResponse.json({
            success: false,
            message: "Server error while creating the appointment"
        },{status:500})
    }
}