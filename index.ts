import { MongoClient, Db } from "mongodb";

import Express, { json } from "express";
import cors from 'cors';
import * as dotenv from "dotenv";
import { quizRoute } from "./routes/quizRouting";

dotenv.config();

var app = Express();
app.use(cors());
app.use(json());

export var dataBaseAccess: Db;

async function connectToDatabase () {
 
  const _MONGO_CONNECTION:string = process.env.MONGO_CONNECTION ?? "";
  const _MONGO_DATABASE_NAME:string = process.env.MONGO_DATABASE_NAME ?? "";

  const client: MongoClient = new MongoClient(_MONGO_CONNECTION);
          
  await client.connect();
      
  dataBaseAccess = client.db(_MONGO_DATABASE_NAME);

  console.log("Conexão executada com êxito"); 
}

app.use("/api/quiz", quizRoute)

app.listen(3030, ()=>{
  console.log(" ");
  connectToDatabase()
  console.log("Servidor em funcionamento");
  console.log(" ");
  
})