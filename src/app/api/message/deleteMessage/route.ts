import prisma from "@/lib/prisma";
import { v2 } from "cloudinary";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";



export default async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({
                success: false,
                message: "User is not logged in",
            }, { status: 400 })
        }

        const { searchParams } = new URL(request.url)

        const messageId = searchParams.get('messageId')

        if (!messageId) {
            return NextResponse.json({
                success: false,
                message: "Message id is not found"
            }, { status: 404 })
        }

        const message = await prisma.message.findFirst({
            where: {
                id: messageId
            }
        })

        if (!message) {
            return NextResponse.json({
                success: false,
                message: "Message doesn not exist"
            }, { status: 500 })
        }

        if (message.messageDocument) {
            const publicId = message.messageDocument
            await v2.uploader.destroy(publicId as string)
        }

        await prisma.message.delete({
            where: {
                id: messageId
            }
        }).catch((error) => {
            return NextResponse.json({
                success: false,
                message: "Error while deleting the message"
            }, { status: 500 })
        })


        return NextResponse.json({
            success: true,
            message: "Message deleted successfully"
        }, { status: 200 })
    } catch (error: any) {
        console.log(error.message)
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })

    }
}