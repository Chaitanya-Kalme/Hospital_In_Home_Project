import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { v2 } from "cloudinary";
import { UploadMessageDocument } from "@/helper/uploadOnCloudinary";



export default async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "User is not logged in",
        }, { status: 400 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const messageId = searchParams.get('messageId') as string
    
        if (!messageId) {
            return NextResponse.json({
                success: false,
                message: "message id is not found"
            }, { status: 404 })
        }
    
        const userMessageData = await request.formData()
        const messageText = userMessageData.get('messageText') as string
        const messageDocument = userMessageData.get('messageDocument') as File
    
        if (!messageDocument || !messageText) {
            return NextResponse.json({
                success: false,
                message: "Text or file is required"
            }, { status: 404 })
        }
    
        const message = await prisma.message.findFirst({
            where: {
                id: messageId
            }
        })
    
        if (messageDocument && message?.messageDocument) {
            const publicId = message.messageDocument
            await v2.uploader.destroy(publicId as string)
            let messageFile
            
            await UploadMessageDocument(messageDocument)
            .then((response) =>{
                messageFile = response.toString()
            })
            .catch((error) =>{
                console.log(error)
                return NextResponse.json({
                    success: false,
                    message: error.message
                },{status: 500}) 
            })
        
            const updatedMessage=  await prisma.message.update({
                where:{
                    id: messageId,
                },
                data:{
                    messageDocument: messageFile,
                }
            })
        }
    
        if(messageText){
            const updatedMessage = await prisma.message.update({
                where:{
                    id: messageId,
                },
                data:{
                    messageText: messageText
                }
    
            })
        }
    
    
        return NextResponse.json({
            success: true,
            message: "Message Updated Successfully"
        },{status:200})
    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            message: "Error while sending message"
        },{status:500})
        
    }

}