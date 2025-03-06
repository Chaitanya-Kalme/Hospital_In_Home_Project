import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import { sendEmail } from "@/helper/sendEmail";
import { UploadAvatarImage } from "@/helper/uploadOnCloudinary";

interface CloudinaryUploadResult {
    public_id: string,
    secure_url: string
    [key: string]: any
}


export async function POST(req: NextRequest){
    try {
        const userForm = (await req.formData())
        const userName = userForm.get('userName') as string
        const email = userForm.get('email') as string
        const password = userForm.get('password') as string
        const avatar = userForm.get('avatar')  as File|| null
        const mobileNo = userForm.get('mobileNo') as string

        if(!userName && !email && !password && !mobileNo && avatar){
            return NextResponse.json({
                success: false,
                message: "All Fields are required"
            },{status:404})
        }

        const patient = await prisma.patient.findFirst({
            where: {
                email: email
            }
        })

        if(patient){
            return NextResponse.json({
                success: false,
                message: "User Already Exist with this email",
            },{status:400})
        }

        let imageName;
        if(avatar!==null){
            await UploadAvatarImage(avatar)
            .then((response) =>{
                imageName = response
            })
            .catch((error) =>{
                return NextResponse.json({
                    success: false,
                    message: "Error while uploading image"
                },{status: 400})
            })
        }
        else{
            imageName = process.env.CLOUDINARY_DEFAULT_IMAGE
        }

        const hashedPassword= await bcrypt.hash(password,10)

        const createdPatient = await prisma.patient.create({
            data:{
                userName: userName,
                email: email,
                password: hashedPassword,
                avatar: imageName,
                mobileNo: mobileNo,
            }
        })

        if(!createdPatient){
            return NextResponse.json({
                success: false,
                message: "Server Error while creating the user"
            },{status:500})
        }

        await sendEmail({email: createdPatient.email,emailType:"VERIFY",userId: createdPatient.id})

        const userToSend = await prisma.patient.findFirst({
            where:{
                id: createdPatient.id
            }
        })

        return NextResponse.json({
            success: true,
            message: "User Created Successfully",
            user: userToSend
        },{status:200})

        
    } catch (error:any) {
        console.log(error.message)
        return NextResponse.json({
            success: false,
            message: "Something went wrong while creating the user"
        },{status:500})
        
    }
}