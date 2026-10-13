require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const formatMessage = require("./utils/message.format");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  isUsernameTaken,
  userLeave,
} = require("./services/user.service");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8080;
const chatbotName = "CS Gap";

const ALLOWED_ROOMS = [
  "ساختمان داده‌ها",
  "طراحی الگوریتم‌ها",
  "سیستم های عامل",
  "مدار های منطقی",
  "معماری کامپیوتر",
  "هوش مصنوعی",
];
const MAX_USERNAME_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 500;

function systemMessage(text) {
  return formatMessage(chatbotName, text, { type: "system" });
}

function sendRoomUsers(room) {
  io.to(room).emit("roomUsers", {
    room,
    users: getRoomUsers(room),
  });
}

io.on("connection", (socket) => {
  socket.on("joinRoom", (payload) => {

    if (getCurrentUser(socket.id)) return;

    const username = String(payload?.username ?? "").trim();
    const room = String(payload?.room ?? "");

    if (!username || username.length > MAX_USERNAME_LENGTH) {
      return socket.emit(
        "joinError",
        `نام کاربری باید بین ۱ تا ${MAX_USERNAME_LENGTH} کاراکتر باشد.`
      );
    }
    if (!ALLOWED_ROOMS.includes(room)) {
      return socket.emit("joinError", "اتاق انتخاب‌شده معتبر نیست.");
    }
    if (isUsernameTaken(username, room)) {
      return socket.emit(
        "joinError",
        "این نام کاربری در این اتاق قبلاً استفاده شده است. نام دیگری انتخاب کنید."
      );
    }

    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit("message", systemMessage("به چت یاد خوش آمدید"));
    socket.broadcast
      .to(user.room)
      .emit("message", systemMessage(`${user.username} به چت وارد شد`));

    sendRoomUsers(user.room);
  });

  socket.on("ChatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;

    const text = String(message ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!text) return;

    io.to(user.room).emit(
      "message",
      formatMessage(user.username, text, { id: socket.id, hue: user.hue })
    );
  });

  socket.on("typing", () => {
    const user = getCurrentUser(socket.id);
    if (!user) return;
    socket.broadcast
      .to(user.room)
      .emit("typing", { id: socket.id, username: user.username });
  });

  socket.on("stopTyping", () => {
    const user = getCurrentUser(socket.id);
    if (!user) return;
    socket.broadcast.to(user.room).emit("stopTyping", { id: socket.id });
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (!user) return;

    io.to(user.room).emit(
      "message",
      systemMessage(`${user.username} چت را ترک کرد`)
    );
    sendRoomUsers(user.room);
  });
});

server.listen(PORT, () => {
  console.log("listening on port " + PORT);
});