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
exports.default = userRoutes;
const zod_1 = __importDefault(require("zod"));
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_creation_body_zod_schema = zod_1.default.object({
    fullName: zod_1.default.string(),
    school: zod_1.default.string(),
    email: zod_1.default.string(),
    password: zod_1.default.string(),
});
const user_delect_body_zod_schema = zod_1.default.object({
    id: zod_1.default.string(),
    email: zod_1.default.string(),
});
function userRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        //GET /user (id)
        app.get("/", { onRequest: [app.authenticate] }, (request, response) => __awaiter(this, void 0, void 0, function* () {
            const user = request.user; //await prisma.user.findFirst({where: {id: request.params.id}})
            if (!user)
                return response.status(404).send({ "message": "User not found" });
            return response.status(200).send(user);
        }));
        // POST /user/create
        app.post("/create", (request, response) => __awaiter(this, void 0, void 0, function* () {
            const requestBody = user_creation_body_zod_schema.parse(request.body);
            const hashedPassword = yield bcrypt_1.default.hash(requestBody.password, 10);
            yield prisma_1.prisma.user.create({ data: Object.assign(Object.assign({}, requestBody), { password: hashedPassword }) }).then((user) => {
                return response.status(201).send({ "info": "User created", "id": user.id });
            }).catch((err) => {
                if (err.code === "P2002")
                    return response.status(403).send({ "info": "Info already used" });
            });
        }));
        app.delete("/delete", (request, response) => __awaiter(this, void 0, void 0, function* () {
            const requestBody = user_delect_body_zod_schema.parse(request.body);
            yield prisma_1.prisma.user.delete({ where: { id: requestBody.id, email: requestBody.email } }).catch((err) => {
                if (err.code === "P2025")
                    return response.status(404).send({ "info": "User not found" });
            });
            return response.status(200).send({ "info": "User deleted" });
        }));
    });
}
