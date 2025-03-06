import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { UploadAvatarImage } from "@/helper/uploadOnCloudinary";
import { v2 } from "cloudinary";
import { getPublicIdFromUrl } from "@/helper/getPublicIdFromURL";


export async function POST(request: NextRequest){
    const session=await getServerSession(authOptions)
    if(!session?.user){
        return NextResponse.json({
            success: false,
            message: "User is not logged In",
        },{status:400})
    }


    try {
        const requestForm = await request.formData()
        const avatar = requestForm.get('avatar') as File 
        if(!avatar){
            return NextResponse.json({
                success: false,
                message: "Avatar File not found"
            },{status:404})
        }

        const doctor = await prisma.doctor.findFirst({
            where:{
                id: session.user.id
            }
        })

        if(!doctor){
            return NextResponse.json({
                success: false,
                message: "User Does not exist"
            },{status:400})
        }

        let imageURL = process.env.CLOUDINARY_DEFAULT_IMAGE
        if(doctor.avatar &&  doctor.avatar !==imageURL){
            const publicId = getPublicIdFromUrl(doctor.avatar)
            v2.uploader.destroy(publicId as string)
        }

        if(avatar){
            await UploadAvatarImage(avatar)
            .then((response) =>{
                imageURL = response.toString()
            })
            .catch((error) =>{
                return NextResponse.json({
                    success: false,
                    message: error.message
                },{status:400})
            })
        }

        const updatedPatient = await prisma.patient.update({
            where:{
                id: doctor.id
            },
            data:{
                avatar: imageURL
            }
        })


        return NextResponse.json({
            success: true,
            message: "Avatar Image updated Successfully"
        },{status:200})
        

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Server Error while updating Avatar Image"
        },{status: 500})
        
    }
    
}


export async function DELETE(request :NextRequest){
    const session=await getServerSession(authOptions)
    if(!session?.user){
        return NextResponse.json({
            success: false,
            message: "User is not logged In",
        },{status:400})
    }

    try {
        console.log(session.user)
        const doctor = await prisma.doctor.findFirst({
            where:{
                id: session?.user.id
            }
        })

        if(!doctor){
            return NextResponse.json({
                success: false,
                message: "User Does not exist"
            },{status:400})
        }
        let imageURL = process.env.CLOUDINARY_DEFAULT_IMAGE
        if(doctor.avatar &&  doctor.avatar !==imageURL){
            const publicId = getPublicIdFromUrl(doctor.avatar)
            v2.uploader.destroy(publicId as string)
        }

        

        const updatedPatient = await prisma.patient.update({
            where:{
                id: doctor.id
            },
            data:{
                avatar: imageURL
            }
        })


        return NextResponse.json({
            success: true,
            message: "Avatar Image updated Successfully"
        },{status:200})
        

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Server Error while updating Avatar Image"
        },{status: 500})
        
    }
}