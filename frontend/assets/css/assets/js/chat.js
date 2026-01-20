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

socket.on("newMessage", (msg) => {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<span>${msg.username}:</span> ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on("onlineUsers", (users) => {
  usersList.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u.username;
    usersList.appendChild(li);
  });
});

function sendMessage(event) {
  event.preventDefault();
  const input = document.getElementById("message");
  socket.emit("sendMessage", input.value);
  input.value = "";
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
      }
