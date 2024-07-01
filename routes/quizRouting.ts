import * as dotenv from "dotenv";
import Express, { Request, Response, Router } from "express";
import { dataBaseAccess } from "..";

dotenv.config();

export var quizRoute = Router()

quizRoute.get("/all", async (request: Request, response: Response) => {
  const allQuizes = await dataBaseAccess.collection("quizList").find({}).toArray();

  return response.send(allQuizes)
})

quizRoute.post("/create", async (request: Request, response: Response) => {
  console.log(request.body);
  
  const result = await dataBaseAccess.collection("quizList").insertOne(JSON.parse(request.body));

  result
  ? response.status(201).send("Quiz criado com êxito")
  : response.status(500).send("A criação não foi executada")
})