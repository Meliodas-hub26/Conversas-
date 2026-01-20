const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) location.href = "login.html";

const socket = io("http://localhost:3000", {
  auth: { token, username: user.username }
});

const messagesDiv = document.getElementById("messages");
const usersList = document.getElementById("usersList");

let currentPrivate = null;

/* HISTÓRICO GLOBAL */
socket.on("chatHistory", msgs => {
  messagesDiv.innerHTML = "";
  msgs.forEach(renderMessage);
});

/* MENSAGEM GLOBAL */
socket.on("newMessage", renderMessage);

/* UTILIZADORES ONLINE */
socket.on("onlineUsers", users => {
  usersList.innerHTML = "";
  users.forEach(u => {
    if (u.id === user.id) return;

    const li = document.createElement("li");
    li.textContent = u.username;
    li.onclick = () => openPrivate(u);
    usersList.appendChild(li);
  });
});

/* CHAT PRIVADO */
socket.on("privateHistory", msgs => {
  messagesDiv.innerHTML = "";
  msgs.forEach(renderPrivate);
});

socket.on("newPrivateMessage", renderPrivate);

function openPrivate(u) {
  currentPrivate = u;
  messagesDiv.innerHTML = "";
  socket.emit("joinPrivate", { toId: u.id, toUsername: u.username });
}

/* ENVIAR */
function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("message");

  if (!input.value.trim()) return;

  if (currentPrivate) {
    socket.emit("privateMessage", {
      toId: currentPrivate.id,
      toUsername: currentPrivate.username,
      text: input.value
    });
  } else {
    socket.emit("sendMessage", input.value);
  }

  input.value = "";
}

/* RENDER */
function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<span>${msg.username}:</span> ${msg.text}`;
  messagesDiv.appendChild(div);
}

function renderPrivate(msg) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `
    <span>${msg.fromUsername} (privado):</span> ${msg.text}
  `;
  messagesDiv.appendChild(div);
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
      }

/* Notificação do browser */
function notify(msg) {
  if (document.hidden) {
    if (Notification.permission === "granted") {
      new Notification(`${msg.username} diz:`, { body: msg.text });
    }
  }
}

/* Pedir permissão */
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

/* Integrar nas mensagens globais e privadas */
function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<span>${msg.username}:</span> ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  notify(msg);
}

function renderPrivate(msg) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<span>${msg.fromUsername} (privado):</span> ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  notify(msg);
  }
