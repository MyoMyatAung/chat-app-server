require("dotenv").config();

const express = require("express");
const cors = require("cors");
const io = require("socket.io");
const { chats } = require("./data/data");
const { connectDB } = require("./config/db");

const userRouter = require("./routes/users.route");
const chatRouter = require("./routes/chat.route");
const messageRouter = require("./routes/message.route");

const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/profilepic", express.static("uploads"));

app.use("/api/user/", userRouter);
app.use("/api/chat/", chatRouter);
app.use("/api/message", messageRouter);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Chat server is running on PORT: ${PORT}`)
);

const IO = io(server, {
  pingTimeout: 30000,
  cors: {
    origin: "http://localhost:3000",
  },
});

IO.on("connection", (socket) => {
  console.log("Websocket successfully connected");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join-chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("new-message", (newMessage) => {
    let chat = newMessage.chat;

    if (!chat.users) return console.log("Chat users are not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit("message-receive", newMessage);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
