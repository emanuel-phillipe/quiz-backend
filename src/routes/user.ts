import type { FastifyInstance, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt"


const user_creation_body_zod_schema = z.object({
  fullName: z.string(),
  school: z.string(),
  email: z.string(),
  password: z.string(),
})

const user_delect_body_zod_schema = z.object({
  id: z.string(),
  email: z.string(),
})

export default async function userRoutes(app:FastifyInstance){

  //GET /user (id)
  app.get("/", {onRequest: [(app as any).authenticate]}, async (request:FastifyRequest, response) => {

    const user = (request as any).user //await prisma.user.findFirst({where: {id: request.params.id}})
    if(!user) return response.status(404).send({"message": "User not found"})

    return response.status(200).send(user)
  })

  // POST /user/create
  app.post("/create", async (request:FastifyRequest, response) => {

    const requestBody = user_creation_body_zod_schema.parse(request.body)
    const hashedPassword = await bcrypt.hash(requestBody.password, 10);

    await prisma.user.create({data: {...requestBody, password: hashedPassword}}).then((user) => {
      return response.status(201).send({"info": "User created", "id": user.id})
    }).catch((err) => {
      if(err.code === "P2002") return response.status(403).send({"info": "Info already used"})
    })
  })

  app.delete("/delete", async (request:FastifyRequest, response) => {

    const requestBody = user_delect_body_zod_schema.parse(request.body)
    
    await prisma.user.delete({where: {id: requestBody.id, email: requestBody.email}}).catch((err) => {
      if(err.code === "P2025") return response.status(404).send({"info": "User not found"})
    })

    return response.status(200).send({"info": "User deleted"})
  })
}