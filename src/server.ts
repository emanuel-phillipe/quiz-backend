import fastify, { type FastifyReply, type FastifyRequest } from "fastify"
import cors from '@fastify/cors'
import userRoutes from "./routes/user"
import quizRoutes from "./routes/quiz"
import authRoutes from "./routes/auth"
import jwt from "@fastify/jwt"
import { Server } from "socket.io"
import http from "http"

const app = fastify()
app.register(cors, {
  origin: "*",
})

const server = http.createServer(app.server)

app.register(jwt, {
  secret: process.env.SECRET_KEY
})

const io = new Server(app.server, {
  cors: {origin: '*'}
})

io.on("connection", (socket) => {
  socket.on("quiz_editing_room", (data) => {
    socket.join(data.quizId)
  })

  socket.on("question_creation", (data) => {    
    socket.to(data.quizId).emit("new_question", data)
  })

  socket.on("cancel_question_creation", (data) => {
    socket.to(data.quizId).emit("cancel_question", data)
  })

  socket.on("question_created", (data) => {
    socket.to(data.quizId).emit("set_created_question", {questions: data.questions})
    socket.to(data.quizId).emit("cancel_question", {responsibleUser: data.responsibleUser})
  })

  socket.on("question_remotion", (data) => {
    socket.to(data.quizId).emit("remove_question", {questions: data.questions})
  })
})

app.decorate("authenticate", async function(request:FastifyRequest, response:FastifyReply<Response>) {
  try {
    await request.jwtVerify()
  } catch (err) {
    console.log(err);
    return response.status(401).send({"info": "User not authenticated"})
  }
})

app.decorate("isAuthenticated", async function(request:FastifyRequest, response:FastifyReply<Response>) {
  try {
    await request.jwtVerify()
    return response.status(409).send({"info": "User already authenticated"})
  } catch (err) {
    // DO NOTHING
  }
})

app.register(userRoutes, {prefix: "/user"})
app.register(quizRoutes, {prefix: "/quiz"})
app.register(authRoutes, {prefix: "/auth"})

app.listen(3000, () => {
  console.log(" ");
  console.log("Quiz Server is running");
  console.log(" ");
})