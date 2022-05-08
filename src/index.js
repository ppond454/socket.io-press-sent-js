import { createServer } from "http"
import { Server } from "socket.io"

const httpServer = createServer()
const io = new Server(httpServer, {
  cors:{
    origin: "*",
  }
})

let users = []

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId })
}

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
  return users.find((user) => user.userId === userId)
}

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.")
  // console.log(socket.id)

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id)
    io.emit("getUsers", users)
  })

  //send and get message
  socket.on("sendMessage", ({ from, to, text ,createdAt , media }) => {
    console.log("to: ",to);
    const user = getUser(to)

    if (!user) return null
    if(user)
    io.to(user.socketId).emit("getMessage", {
      to,
      from,
      text,
      createdAt,
      media,
    })
  })

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!")
    removeUser(socket.id)
    io.emit("getUsers", users)
  })


})
httpServer.listen(4000)
