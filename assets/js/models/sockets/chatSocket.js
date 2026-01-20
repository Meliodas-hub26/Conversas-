import Message from "../models/Message.js";
import jwt from "jsonwebtoken";

const onlineUsers = new Map();

export default function chatSocket(io) {

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        id: decoded.id,
        username: socket.handshake.auth.username
      };

      next();
    } catch {
      next(new Error("Não autorizado"));
    }
  });

  io.on("connection", (socket) => {
    const { id, username } = socket.user;

    // Guardar utilizador online
    onlineUsers.set(socket.id, { id, username });

    // Enviar lista atualizada
    io.emit("onlineUsers", Array.from(onlineUsers.values()));

    console.log(`${username} entrou no chat`);

    socket.on("sendMessage", async (text) => {
      const message = await Message.create({
        userId: id,
        username,
        text
      });

      io.emit("newMessage", {
        username,
        text,
        createdAt: message.createdAt
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.values()));
      console.log(`${username} saiu do chat`);
    });
  });
}
