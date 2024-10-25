import fastify, { type FastifyReply, type FastifyRequest } from "fastify"
import cors from '@fastify/cors'
import userRoutes from "./routes/user"
import quizRoutes from "./routes/quiz"
import authRoutes from "./routes/auth"
import jwt from "@fastify/jwt"

const app = fastify()
app.register(cors, {
  origin: "*",
})

app.register(jwt, {
  secret: process.env.SECRET_KEY
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

app.listen({port: 3000}).then(() => {
  console.log(" ");
  console.log("Quiz Server is running");
  console.log(" ");
})