const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "chat.db");
const HISTORY_LIMIT = 50;

const db = new sqlite3.Database(DB_PATH);
let onlineCount = 0;
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      time INTEGER NOT NULL
    )`
  );
});

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  onlineCount += 1;
  io.emit("chat:online", { count: onlineCount });

  db.all(
    "SELECT name, message, time FROM messages ORDER BY time DESC LIMIT ?",
    [HISTORY_LIMIT],
    (err, rows) => {
      if (err) {
        console.error("Failed to load history:", err);
        return;
      }
      socket.emit("chat:history", rows.reverse());
    }
  );

  socket.on("chat:message", (payload) => {
    // Broadcast to all clients
    const name = payload.name || "Anonymous";
    const message = payload.message || "";
    const time = Date.now();

    db.run(
      "INSERT INTO messages (name, message, time) VALUES (?, ?, ?)",
      [name, message, time],
      (err) => {
        if (err) {
          console.error("Failed to save message:", err);
        }
      }
    );

    io.emit("chat:message", { name, message, time });
  });

  socket.on("chat:join", (payload) => {
    const name = payload.name || "Anonymous";
    socket.data.name = name;
    io.emit("chat:system", {
      message: `${name} joined the chat`,
      time: Date.now(),
    });
  });

  socket.on("disconnect", () => {
    onlineCount = Math.max(onlineCount - 1, 0);
    io.emit("chat:online", { count: onlineCount });
    if (socket.data && socket.data.name) {
      io.emit("chat:system", {
        message: `${socket.data.name} left the chat`,
        time: Date.now(),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
