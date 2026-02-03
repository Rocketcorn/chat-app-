const socket = io();
const form = document.getElementById("chat-form");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const messagesEl = document.getElementById("messages");
const onlineCountEl = document.getElementById("online-count");
let joined = false;

function formatTime(ts) {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addMessage({ name, message, time, system }) {
  const div = document.createElement("div");
  div.className = system ? "message system" : "message";

  if (system) {
    const msgEl = document.createElement("div");
    msgEl.textContent = message;
    const timeEl = document.createElement("time");
    timeEl.textContent = formatTime(time);
    div.appendChild(msgEl);
    div.appendChild(timeEl);
  } else {
    const nameEl = document.createElement("strong");
    nameEl.textContent = name;
    const timeEl = document.createElement("time");
    timeEl.textContent = formatTime(time);
    const msgEl = document.createElement("div");
    msgEl.textContent = message;
    div.appendChild(nameEl);
    div.appendChild(timeEl);
    div.appendChild(msgEl);
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

socket.on("chat:message", (payload) => {
  addMessage(payload);
});

socket.on("chat:history", (items) => {
  if (!Array.isArray(items)) return;
  items.forEach(addMessage);
});

socket.on("chat:system", (payload) => {
  addMessage({ ...payload, system: true });
});

socket.on("chat:online", ({ count }) => {
  if (onlineCountEl) onlineCountEl.textContent = String(count);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim() || "Anonymous";
  const message = messageInput.value.trim();
  if (!message) return;
  if (!joined) {
    socket.emit("chat:join", { name });
    joined = true;
  }
  socket.emit("chat:message", { name, message });
  messageInput.value = "";
  messageInput.focus();
});
