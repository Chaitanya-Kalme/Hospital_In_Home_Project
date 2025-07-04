import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider  from "next-auth/providers/credentials";
import { NextResponse, userAgent } from "next/server";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: "Credentials",
            credentials:{
                email: {label: "Email",type: "text"},
                password: {label: "password", type: "password"},
                role: {label: "role", type: "text"}
            },
            async authorize(credentials, req): Promise<any> {
                try {
                    let patient,doctor;
                    if(credentials?.role==="Patient"){
                        patient = await prisma.patient.findFirst({
                            where:{
                                email: credentials.email
                            },
                        })
                        if(!patient){
                            throw new Error("User Does not Exist")
                        }
                        if(!patient.isVerified){
                            throw new Error("User is not Verified")
                        }
                        const isPasswordCorrect = await bcrypt.compare(credentials.password,patient.password)
                        if(isPasswordCorrect){
                            return {...patient,role: "Patient"}
                        }
                        else{
                            return null
                        }  
                    }
                    else if(credentials?.role==="Doctor"){
                        doctor = await prisma.doctor.findFirst({
                            where:{
                                email: credentials.email,
                            }
                        })
                        if(!doctor){
                            throw new Error("User Does not Exist")
                        }
                        if(!doctor.isVerified){
                            throw new Error("User is not Verified")
                        }
                        const isPasswordCorrect = await bcrypt.compare(credentials.password,doctor.password);
                        if(isPasswordCorrect){
                            return {...doctor,role: "Doctor"}
                        }
                        else{
                            return null
                        }
                    }
                    else if(credentials?.role==="Admin"){
                        const email = credentials.email
                        const password = credentials.password
                        if(email!==process.env.ADMIN_EMAIL){
                            throw new Error("Invalid Email Address")
                        }
                        else if(password!==process.env.ADMIN_PASSWORD){
                            throw new Error("Invalid Password")
                        }
                        else{
                            const user ={
                                userName: "ADMIN",
                                email: email,
                                password: password,
                                role: credentials.role
                            }
                            return user
                        }
                    }

                } catch (error:any) {
                   throw new Error(error)
                }
            },
        }),
    ],
    callbacks:{
        async jwt({token,user}){
            if(user){
                token.id= user.id,
                token.userName =user.userName
                token.email = user.email
                token.isVerified = user.isVerified
                token.role = user.role
            }
            return token
        },
        async session({session,token}){
            if(token){
                session.user.id = token.id
                session.user.userName = token.userName
                session.user.email = token.email
                session.user.isVerified = token.isVerified
                session.user.role = token.role
            }
            return session
        }
    },
    pages:{
        signIn:'/sign-in'
    },
    session: {
        strategy:"jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}