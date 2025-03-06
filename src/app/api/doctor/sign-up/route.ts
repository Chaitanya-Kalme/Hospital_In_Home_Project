import { UploadAvatarImage, UploadDoctorDocuments } from "@/helper/uploadOnCloudinary";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        const doctorData = await request.formData()
        const userName = doctorData.get('userName') as string
        const email = doctorData.get('email') as string
        const password = doctorData.get('password') as string
        const avatar = doctorData.get('avatar') as File 
        const mobileNo = doctorData.get('mobileNo') as string
        const specialites = doctorData.get('specialites') as string
        const documentForVerification= doctorData.getAll('documentForVerification') as any
    
        if(!userName && !email && !password && !avatar && !mobileNo && !documentForVerification){
            return NextResponse.json({
                success: false,
                message: "All Fields are required",
            },{status:404})
        }
    
        const isDoctorAccountExist = await prisma.doctor.findFirst({
            where: {
                email: email
            }
        })
    
        if(isDoctorAccountExist){
            return NextResponse.json({
                success: false,
                message: "User Account Already Exist"
            },{status:400})
        }

        let imageURL;
        if(avatar){
            await UploadAvatarImage(avatar)
            .then((response) =>{
                imageURL = response.toString()
            })
            .catch((error) =>{
                return NextResponse.json({
                    success: false,
                    message: "Error while uploading image."
                },{status:500})
            })

        }
        const hashedPassword = await bcrypt.hash(password,10)
        let documentsArray: Array<string>=[];

        const uploadDocuments=  async () =>{
            const uploadPromises = documentForVerification.map(async (document: File) =>{
                await UploadDoctorDocuments(document)
                .then((response) =>{
                    documentsArray.push(response.toString())
                })
                .catch((error) =>{
                    console.log(error)
                    return NextResponse.json({
                        success: false,
                        message: "Error while uploading the Document."
                    })
                })
            })
            await Promise.all(uploadPromises);
            const doctor= await prisma.doctor.create({
                data:{
                    userName,
                    email,
                    password: hashedPassword,
                    avatar: imageURL!,
                    mobileNo,
                    documentForVerification: documentsArray, 
                    specialites
                }
            })
        
            if(!doctor){
                return NextResponse.json({
                    success: false,
                    message: "Error while creating the account"
                },{status:500})
            }
        }
        uploadDocuments()

    
    
        return NextResponse.json({
            success: true,
            message: "User Account Created Successfully"
        },{status:200})
    } catch (error:any) {
        console.log(error.message)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        },{status: 500})
    }
}