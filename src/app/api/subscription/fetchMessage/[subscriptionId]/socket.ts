import { createServer } from "http";
import { Server } from "https";
import next from "next";
import { NextRequest, NextResponse } from "next/server";


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });

export default async function GET(request:NextRequest ,response: NextResponse){
    const httpServer = createServer(app.getRequestHandler())  
    
    const io = new Server(httpServer)

    io.on("message",() =>{
        console.log()
    })
}