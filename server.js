require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let whiteboardData = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send the existing whiteboard data to the user
  socket.emit("load_whiteboard", whiteboardData);

  // Listen for draw start events and store them
  socket.on("draw_start", (data) => {
    whiteboardData.push({ ...data, type: "start" });
  });

  // Listen for draw events and broadcast them
  socket.on("draw", (data) => {
    whiteboardData.push(data);
    socket.broadcast.emit("update_whiteboard", data);
  });

  // Listen for clear board event
  socket.on("clear_board", () => {
    whiteboardData = [];
    io.emit("clear_board");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
