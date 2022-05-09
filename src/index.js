import { createServer } from "http"
import { Server } from "socket.io"
import express from "express"
import eiows from "eiows"
import "dotenv/config"

const app = express()

const PORT = process.env.PORT || 4000
const URL = process.env.URL_DEPLOYMENT || "http://localhost:3000"

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: URL,
  },
  wsEngine: eiows.Server,
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
  console.log("a user connected.")

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id)
    io.emit("getUsers", users)
  })

  socket.on("sendMessage", ({ from, to, text, createdAt, media }) => {
    console.log("to: ", to)
    const user = getUser(to)

    if (!user) return null
    if (user)
      io.to(user.socketId).emit("getMessage", {
        to,
        from,
        text,
        createdAt,
        media,
      })
  })

  socket.on("disconnect", () => {
    console.log("a user disconnected!")
    removeUser(socket.id)
    io.emit("getUsers", users)
  })
})
httpServer.listen(PORT, () => console.log("server is running on port 4000"))
