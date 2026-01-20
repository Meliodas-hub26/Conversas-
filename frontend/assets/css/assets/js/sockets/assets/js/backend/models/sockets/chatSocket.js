import Message from "../models/Message.js";
import PrivateMessage from "../models/PrivateMessage.js";
import jwt from "jsonwebtoken";

const onlineUsers = new Map();
const HISTORY_LIMIT = 50;

function privateRoom(id1, id2) {
  return ["private", id1, id2].sort().join(":");
}

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

    onlineUsers.set(socket.id, { id, username });
    io.emit("onlineUsers", Array.from(onlineUsers.values()));

    // Histórico global
    const messages = await Message.find()
      .sort({ createdAt: 1 })
      .limit(HISTORY_LIMIT);

    socket.emit("chatHistory", messages);

    /* CHAT GLOBAL */
    socket.on("sendMessage", async (text) => {
      const msg = await Message.create({ userId: id, username, text });
      io.emit("newMessage", msg);
    });

    /* ENTRAR EM CHAT PRIVADO */
    socket.on("joinPrivate", async ({ toId, toUsername }) => {
      const room = privateRoom(id, toId);
      socket.join(room);

      const history = await PrivateMessage.find({ room })
        .sort({ createdAt: 1 })
        .limit(HISTORY_LIMIT);

      socket.emit("privateHistory", history);
    });

    /* ENVIAR MENSAGEM PRIVADA */
    socket.on("privateMessage", async ({ toId, toUsername, text }) => {
      const room = privateRoom(id, toId);

      const msg = await PrivateMessage.create({
        room,
        from: id,
        to: toId,
        fromUsername: username,
        toUsername,
        text
      });

      io.to(room).emit("newPrivateMessage", msg);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.values()));
    });
  });
      }
