import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { UploadMessageDocument } from "@/helper/uploadOnCloudinary"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"



export  async function POST(request: NextRequest,{params}:{params: {subscriptionId: string}}){
    const session =await getServerSession(authOptions)
    if(!session || !session.user){
        return NextResponse.json({
            success: false,
            message: "User is not logged in",
        },{status:400})
    }

    const urlParams= await params
    const subscriptionId = urlParams.subscriptionId

    const userMessageData = await request.formData()
    const messageText= userMessageData.get('messageText') as string
    const userId = userMessageData.get('userId') as string
    const role = session.user.role
    const messageDocument = userMessageData.get('messageDocument') as File

    if(!messageDocument && !messageText){
        return NextResponse.json({
            success: false,
            message: "File or Text is required for sending message",
        },{status:404})
    }

    if(!userId){
        return NextResponse.json({
            success: false,
            message: "User id is required for sending the message"
        },{status:404})
    }

    let user;

    if(role==="Patient"){
        user = await prisma.patient.findFirst({
            where:{
                id: userId
            },
            omit:{
                password: true
            }
        })
    }
    else if(role==="Doctor"){
        user = await prisma.doctor.findFirst({
            where:{
                id: userId
            },
            omit:{
                password: true
            }
        })
    }

    if(!user){
        return NextResponse.json({
            success: false,
            message: "User is not found"
        },{status: 400})
    }

    let messageFile;
    
    if(messageDocument){
        await UploadMessageDocument(messageDocument)
        .then((response) =>{
            messageFile = response.toString()
        })
        .catch((error)=>{
            console.log(error)
            return NextResponse.json({
                success: false,
                message: "Error while uploading the document"
            },{status:404})
        } )
    }

    const messageCreated = await prisma.message.create({
        data:{
            userId: userId,
            messageText: messageText,
            messageDocument: messageFile,
            subscriptionId: subscriptionId
        }
    })
    
    if(!messageCreated){
        return NextResponse.json({
            success: false,
            message: "Error while creating the message"
        },{status:500})
    }


    return NextResponse.json({
        success: true,
        message: "Message created successfully",
        messageCreated: messageCreated
    },{status:200})


}