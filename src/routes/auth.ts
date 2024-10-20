import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt"

const user_auth_body_zod_schema = z.object({
  email: z.string(),
  password: z.string(),
})

const validate_body_zod_schema = z.object({
  token: z.string()
})

export default async function authRoutes(app:FastifyInstance){

  app.post("/login", {onRequest: [(app as any).isAuthenticated]}, async (request: FastifyRequest, response) => {

    const requestBody = user_auth_body_zod_schema.parse(request.body)

    let user = await prisma.user.findFirst({where: {email: requestBody.email}})
    if (!user) return response.status(404).send({"info": "User not found"})

    const isPasswordCorrect = await bcrypt.compare(requestBody.password, user.password)
    if (!isPasswordCorrect) return response.status(401).send({"info": "Incorrect password"})

    const { password: _, ...userFiltered } = user;

    const jwtToken = app.jwt.sign(userFiltered)

    return response.status(200).send({"info": jwtToken})
  })

  app.post("/validate", async (request:FastifyRequest, response) => {
    const requestBody = validate_body_zod_schema.parse(request.body)

    const tokenVerification = app.jwt.verify(requestBody.token)
    
    if(!tokenVerification) return response.status(401).send({"info": false})

    return response.status(200).send({"info": true})
  })
}