const express = require("express");
const morgan = require("morgan");
const socketIO = require("socket.io");

const app = express();
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

// Here's where we store our website's users.
let users = [
  { name: "Tina", favDestination: "co" },
  { name: "Sarah", favDestination: "is" },
  { name: "Juliette", favDestination: "tr" },
  { name: "Céline", favDestination: "jp" },
  { name: "Wayne", favDestination: "vn" },
];

app.use(express.static("public"));

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Socket.IO server is attached to our server
const io = socketIO(server);
io.on("connection", (socket) => {
  console.log(socket.id, "has made a persistent connection to the server!");
  // To send an event from the server
  socket.emit("all-users", users);

  // To receive a message from the client
  socket.on("new-user", (user) => {
    console.log("received a user", user);
    users.push(user);
    socket.broadcast.emit("new-user", user);
  });
});
