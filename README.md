# Online Web Chat App

A minimal real-time web chat app built with Node.js and Socket.IO.  
Supports live messaging, online user count, join/leave system messages, and message history saved in SQLite.

## Features
- Real-time chat with Socket.IO
- Online user count
- Join/leave system messages
- Recent message history (SQLite)
- Basic XSS protection

## Tech Stack
- Node.js
- Express
- Socket.IO
- SQLite

## Run Locally
```bash
cd "/Users/ka/Documents/New project/chat-app"
npm install
npm start
```

Open in your browser:
```
http://localhost:3000
```

## Notes
- Messages are stored in `chat.db` (ignored by Git).
- This project is intended for learning and local use.
