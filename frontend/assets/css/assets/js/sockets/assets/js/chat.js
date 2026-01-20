const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  window.location.href = "login.html";
}

const socket = io("http://localhost:3000", {
  auth: {
    token,
    username: user.username
  }
});

const messagesDiv = document.getElementById("messages");
const usersList = document.getElementById("usersList");

/* HISTÓRICO */
socket.on("chatHistory", (messages) => {
  messagesDiv.innerHTML = "";
  messages.forEach(msg => renderMessage(msg));
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

/* NOVAS MENSAGENS */
socket.on("newMessage", (msg) => {
  renderMessage(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

/* UTILIZADORES ONLINE */
socket.on("onlineUsers", (users) => {
  usersList.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u.username;
    usersList.appendChild(li);
  });
});

function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = "message";

  div.innerHTML = `
    <span>${msg.username}:</span>
    ${msg.text}
  `;

  messagesDiv.appendChild(div);
}

function sendMessage(event) {
  event.preventDefault();
  const input = document.getElementById("message");

  if (!input.value.trim()) return;

  socket.emit("sendMessage", input.value);
  input.value = "";
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
