import Message from "../models/Message.js";
import jwt from "jsonwebtoken";

const onlineUsers = new Map();
const HISTORY_LIMIT = 50;

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

  io.on("connection", async (socket) => {
    const { id, username } = socket.user;

    // Guardar utilizador online
    onlineUsers.set(socket.id, { id, username });
    io.emit("onlineUsers", Array.from(onlineUsers.values()));

    // ENVIAR HISTÓRICO
    const messages = await Message
      .find()
      .sort({ createdAt: 1 })
      .limit(HISTORY_LIMIT);

    socket.emit("chatHistory", messages);

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
    });
  });
}
