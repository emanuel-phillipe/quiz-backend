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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const user_1 = __importDefault(require("./routes/user"));
const quiz_1 = __importDefault(require("./routes/quiz"));
const auth_1 = __importDefault(require("./routes/auth"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const app = (0, fastify_1.default)();
app.register(cors_1.default, {
    origin: "*",
});
app.register(jwt_1.default, {
    secret: process.env.SECRET_KEY
});
app.decorate("authenticate", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield request.jwtVerify();
        }
        catch (err) {
            return response.status(401).send({ "info": "User not authenticated" });
        }
    });
});
app.decorate("isAuthenticated", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield request.jwtVerify();
            return response.status(409).send({ "info": "User already authenticated" });
        }
        catch (err) {
            // DO NOTHING
        }
    });
});
app.register(user_1.default, { prefix: "/user" });
app.register(quiz_1.default, { prefix: "/quiz" });
app.register(auth_1.default, { prefix: "/auth" });
app.listen({ port: 3000 }).then(() => {
    console.log(" ");
    console.log("Quiz Server is running");
    console.log(" ");
});
