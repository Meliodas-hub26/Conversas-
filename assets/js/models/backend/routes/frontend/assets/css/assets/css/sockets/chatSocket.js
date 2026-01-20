/* A ESCREVER GLOBAL */
socket.on("typing", () => {
  socket.broadcast.emit("typing", { username });
});

/* A ESCREVER PRIVADO */
socket.on("typingPrivate", ({ toId }) => {
  const room = privateRoom(id, toId);
  socket.to(room).emit("typingPrivate", { username });
});
