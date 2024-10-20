import type { Quiz, User } from "@prisma/client";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const quiz_creation_body_zod_schema = z.object({
  title: z.string(),
  creators: z.string().array(),
  questions: z.object({
    header: z.string(),
    options: z.string().array(),
    answer: z.string(),
    descriptions: z.string().array(),
    latex: z.boolean(),
  }).array()
})

export default async function quizRoutes(app:FastifyInstance){

  app.get("/all", {onRequest: [(app as any).authenticate]}, async (request:FastifyRequest, response) => {
    const quizes = await Promise.all((await prisma.quiz.findMany()).map(async (quiz) => {
      let questions = await prisma.question.findMany({where: {quizId: quiz.id}})

      return {...quiz, questions: questions}
    }))
    
    return response.status(200).send(quizes)
  })

  app.post("/create", {onRequest: [(app as any).authenticate]}, async (request: FastifyRequest, response) => {

    let requestBody = quiz_creation_body_zod_schema.parse(request.body)
    const requestUser = (request as any).user
    const user = await prisma.user.findFirst({where: {id: requestUser.id}})

    if(!user) return response.status(404).send({"info": "User not found"})

    let {questions: _, ...quizWithoutQuestions} = requestBody
    let newQuiz = {...quizWithoutQuestions, creatorId: user.id}

    const createdQuiz = await prisma.quiz.create({data: newQuiz})

    let questions:any = [];
    requestBody.questions.map((question) => {
    questions.push({...question, quizId: createdQuiz.id})
    })

    await prisma.question.createMany({data: questions})

    return response.status(201).send({"info": "Quiz created"})

  })
}
// model Quiz {
//   id        String     @id @default(cuid())
//   title     String
//   creator   User       @relation(fields: [creatorId], references: [id])
//   creators  String[]
//   creatorId String
//   questions Question[]
// }

// model Question {
//   id           String   @id @default(cuid())
//   quiz         Quiz     @relation(fields: [quizId], references: [id])
//   quizId       String
//   header       String
//   options      String[]
//   answer       String
//   descriptions String[]
//   latex        Boolean