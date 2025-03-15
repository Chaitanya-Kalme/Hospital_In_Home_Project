import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadStream } from "cloudinary"


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

interface CloudinaryUploadResult {
    public_id: string,
    secure_url: string
    [key: string]: any
}


// UPLOAD THE AVATAR IMAGE ON CLOUDINARY
export async function UploadAvatarImage(avatarFile: File) {
    try {
        if (!avatarFile) {
            return NextResponse.json({
                success: false,
                message: "Avatar File not found"
            }, { status: 404 })
        }

        const bytes = await avatarFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "avatar-images" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult)
                    }
                )
                uploadStream.end(buffer)
            }
        )
        return result.secure_url
    } catch (error:any) {
        throw new Error(error)
    }

}


// UPLOAD THE DOCTOR DOCUMENTS ON CLOUDINARY
export async function UploadDoctorDocuments(document: File){
    try {
        if(!document){
            return NextResponse.json({
                success: false,
                message: "Document not found"
            },{status:404})
        }

        const bytes= await document.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve,reject) =>{
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "doctor-documents" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult)
                    }
                )
                uploadStream.end(buffer)
            }
        )
        return result.secure_url
        
    } catch (error: any) {
        throw new Error(error)
        
    }
}


// UPLOAD THE MESSAGE DOCUMENT
export async function UploadMessageDocument(document: File){
    try {
        if(!document){
            return NextResponse.json({
                success: false,
                message: "Document not found"
            },{status:404})
        }

        const bytes= await document.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve,reject) =>{
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "message-documents" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult)
                    }
                )
                uploadStream.end(buffer)
            }
        )
        return result.secure_url
        
    } catch (error: any) {
        throw new Error(error)
        
    }
}
