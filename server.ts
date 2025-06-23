import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import prisma from "./src/lib/prisma"


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;


const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("User is connected")

    socket.on("createMessage", async (messageData, callback) => {
      const { messageText, userId, role, messageDocument, subscriptionId } = messageData;

      

      if (!messageDocument && !messageText) {
        return callback({
          success: false,
          message: "File or Text is required for sending message",
        });
      }

      if (!userId) {
        return callback({
          success: false,
          message: "User id is required for sending the message",
        });
      }

      let user;

      try {
        if (role === "Patient") {
          user = await prisma.patient.findFirst({
            where: { id: userId },
          });
        } else if (role === "Doctor") {
          user = await prisma.doctor.findFirst({
            where: { id: userId },
          });
        }

        if (!user) {
          return callback({
            success: false,
            message: "User is not found",
          });
        }

        let messageFile;

        // if (messageDocument) {
        //   try {
        //     const response = await UploadMessageDocument(messageDocument);
        //     messageFile = response.toString();
        //   } catch (error) {
        //     console.error(error);
        //     return callback({
        //       success: false,
        //       message: "Error while uploading the document",
        //     });
        //   }
        // }
        const messageCreated = await prisma.message.create({
          data: {
            userId: userId,
            messageText: messageText,
            // messageDocument: messageFile,
            subscriptionId: subscriptionId,
          },
        });

        if (!messageCreated) {
          return callback({
            success: false,
            message: "Error while creating the message",
          });
        }

        io.to(messageData.subscriptionId).emit("newMessage",messageCreated)
        callback({
          success: true,
          message: "Message created successfully",
          messageCreated,
        });


      } catch (err) {
        console.error("Server error:", err);
        callback({
          success: false,
          message: "Internal server error",
          data: messageData
        });
      }
    });

    socket.on("fetchMessage",async (messageData,callback) =>{
      const {subscriptionId} = messageData;

      if(!subscriptionId){
        callback({
          success: false,
          message: "Subscription Id is required"
        })
      }

      const subscription = await prisma.subscription.findFirst({
        where:{
          id: subscriptionId
        },
        include:{
          patient: true,
          doctor: true,
          messages: true
        }
      })

      callback({
        success: true,
        message: "Message Fetched successfully",
        data: subscription
      })
    })

  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});