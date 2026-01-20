import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import chatSocket from "./sockets/chatSocket.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

chatSocket(io);

server.listen(process.env.PORT, () => {
  console.log("Servidor com Socket.IO ativo");
});
