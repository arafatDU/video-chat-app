const { Server } = require('socket.io');

const io = new Server(8000, {
  cors: true,
});


io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", data);
  }); 
})
