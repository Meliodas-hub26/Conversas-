const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

async function loadProfile() {
  const res = await fetch("http://localhost:3000/api/users/me", { headers });
  const user = await res.json();

  document.getElementById("username").value = user.username;
  document.getElementById("bio").value = user.bio;
  document.getElementById("avatar").value = user.avatar;
  document.getElementById("avatarPreview").src = user.avatar;
}

async function updateProfile() {
  const username = document.getElementById("username").value;
  const bio = document.getElementById("bio").value;
  const avatar = document.getElementById("avatar").value;

  const res = await fetch("http://localhost:3000/api/users/me", {
    method: "PATCH",
    headers,
    body: JSON.stringify({ username, bio, avatar })
  });

  const updated = await res.json();
  alert("Perfil atualizado!");
  document.getElementById("avatarPreview").src = updated.avatar;
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

loadProfile();
