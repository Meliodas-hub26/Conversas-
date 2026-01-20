let typingTimeout;
const messageInput = document.getElementById("message");

/* GLOBAL */
messageInput.addEventListener("input", () => {
  if (!currentPrivate) {
    socket.emit("typing");
  } else {
    socket.emit("typingPrivate", { toId: currentPrivate.id });
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    removeTyping();
  }, 1000);
});

function removeTyping() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

/* RECEBER TYPING GLOBAL */
socket.on("typing", ({ username }) => {
  showTyping(`${username} está a escrever...`);
});

/* RECEBER TYPING PRIVADO */
socket.on("typingPrivate", ({ username }) => {
  showTyping(`${username} está a escrever... (privado)`);
});

function showTyping(text) {
  removeTyping();
  const div = document.createElement("div");
  div.id = "typingIndicator";
  div.style.fontStyle = "italic";
  div.style.fontSize = "0.85rem";
  div.style.color = "#aaa";
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
