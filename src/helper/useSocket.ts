import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3000"); // or just io() if same origin

export default socket;