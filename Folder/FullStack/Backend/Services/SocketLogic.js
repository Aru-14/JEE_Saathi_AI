// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const Room = require("./models/Room");
// const Message = require("./models/Message");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });
// app.use(express.json());

// io.on("connection", (socket) => {
//   let currentUserId = null;

//   socket.on("registerUser", async (userId) => {
//     currentUserId = userId;
//     console.log(`User registered: ${userId}`);

//     // Send rooms where user is a member
//     const rooms = await Room.find({ members: userId });
//     socket.emit("userRooms", rooms);
//   });

//   // Join room + send old messages
//   socket.on("joinRoom", async ({ userId, roomName, type = "group" }) => {
//     currentUserId = userId;

//     let room = await Room.findOne({ name: roomName });
//     if (!room) {
//       room = new Room({ name: roomName, type, members: [userId] });
//       await room.save();
//     } else if (!room.members.includes(userId)) {
//       room.members.push(userId);
//       await room.save();
//     }

//     socket.join(roomName);
//     console.log(`${userId} joined ${roomName}`);

//     // Send previous messages from this room
//     const messages = await Message.find({ room: roomName }).sort("createdAt");
//     socket.emit("roomMessages", { room: roomName, messages });
//   });

//   // Store chat messages
//   socket.on("chatMessage", async ({ room, msg }) => {
//     if (!currentUserId) return;

//     const newMsg = new Message({
//       room,
//       sender: currentUserId,
//       text: msg,
//     });
//     await newMsg.save();

//     io.to(room).emit("message", { room, msg, sender: currentUserId });
//     const messages = await Message.find({ room: roomName }).sort("createdAt");
//     socket.emit("roomMessages", { room: roomName, messages });
//   });

//   socket.on("disconnect", async () => {
//     console.log("Client disconnected");
//     if (currentUserId) {
//       await Room.updateMany(
//         { members: currentUserId },
//         { $pull: { members: currentUserId } }
//       );
//       await Room.deleteMany({ type: "group", members: { $size: 0 } });
//       console.log(`Removed ${currentUserId} from all rooms`);
//     }
//   });
// });

// server.listen(5000, () => console.log("Server running on port 5000"));
// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Room = require("./models/Room");
const Message = require("./models/Message");

const app = express();
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

// // Connect MongoDB
// mongoose.connect("mongodb://127.0.0.1:27017/chatApp");

io.on("connection", (socket) => {
  let currentUserId = null;

  // Register user
  socket.on("registerUser", async (userId) => {
    currentUserId = userId;
    const rooms = await Room.find({ members: userId });
    socket.emit("userRooms", rooms);
  });

  // Join room and send all messages
  socket.on("joinRoom", async ({ userId, roomName, type = "group" }) => {
    currentUserId = userId;

    let room = await Room.findOne({ name: roomName });
    if (!room) {
      room = new Room({ name: roomName, type, members: [userId] });
      await room.save();
    } else if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    socket.join(roomName);

    // Send all messages of this room from MongoDB
    const messages = await Message.find({ room: roomName }).sort("createdAt");
    socket.emit("roomMessages", { room: roomName, messages });
  });

  // Handle new messages
  socket.on("chatMessage", async ({ room, msg }) => {
    if (!currentUserId) return;

    const newMsg = await Message.create({
      room,
      sender: currentUserId,
      text: msg,
    });

    // Send the updated messages array for the room
    const messages = await Message.find({ room }).sort("createdAt");
    io.to(room).emit("roomMessages", { room, messages });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

