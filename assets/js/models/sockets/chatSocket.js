import Message from "../models/Message.js";
import jwt from "jsonwebtoken";

export default function chatSocket(io) {

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Não autorizado"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Utilizador ligado:", socket.user.id);

    socket.on("sendMessage", async (text) => {
      const user = socket.user;

      const message = await Message.create({
        userId: user.id,
        username: socket.handshake.auth.username,
        text
      });

      io.emit("newMessage", {
        username: message.username,
        text: message.text,
        createdAt: message.createdAt
      });
    });

    socket.on("disconnect", () => {
      console.log("Utilizador desconectado");
    });
  });
}
