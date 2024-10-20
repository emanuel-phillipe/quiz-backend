"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = quizRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const quiz_creation_body_zod_schema = zod_1.z.object({
    title: zod_1.z.string(),
    creators: zod_1.z.string().array(),
    questions: zod_1.z.object({
        header: zod_1.z.string(),
        options: zod_1.z.string().array(),
        answer: zod_1.z.string(),
        descriptions: zod_1.z.string().array(),
        latex: zod_1.z.boolean(),
    }).array()
});
function quizRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.get("/all", { onRequest: [app.authenticate] }, (request, response) => __awaiter(this, void 0, void 0, function* () {
            const quizes = yield Promise.all((yield prisma_1.prisma.quiz.findMany()).map((quiz) => __awaiter(this, void 0, void 0, function* () {
                let questions = yield prisma_1.prisma.question.findMany({ where: { quizId: quiz.id } });
                return Object.assign(Object.assign({}, quiz), { questions: questions });
            })));
            return response.status(200).send(quizes);
        }));
        app.post("/create", { onRequest: [app.authenticate] }, (request, response) => __awaiter(this, void 0, void 0, function* () {
            let requestBody = quiz_creation_body_zod_schema.parse(request.body);
            const requestUser = request.user;
            const user = yield prisma_1.prisma.user.findFirst({ where: { id: requestUser.id } });
            if (!user)
                return response.status(404).send({ "info": "User not found" });
            let { questions: _ } = requestBody, quizWithoutQuestions = __rest(requestBody, ["questions"]);
            let newQuiz = Object.assign(Object.assign({}, quizWithoutQuestions), { creatorId: user.id });
            const createdQuiz = yield prisma_1.prisma.quiz.create({ data: newQuiz });
            let questions = [];
            requestBody.questions.map((question) => {
                questions.push(Object.assign(Object.assign({}, question), { quizId: createdQuiz.id }));
            });
            yield prisma_1.prisma.question.createMany({ data: questions });
            return response.status(201).send({ "info": "Quiz created" });
        }));
    });
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
