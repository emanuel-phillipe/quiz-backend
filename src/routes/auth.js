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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_auth_body_zod_schema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string(),
});
const validate_body_zod_schema = zod_1.z.object({
    token: zod_1.z.string()
});
function authRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post("/login", { onRequest: [app.isAuthenticated] }, (request, response) => __awaiter(this, void 0, void 0, function* () {
            const requestBody = user_auth_body_zod_schema.parse(request.body);
            let user = yield prisma_1.prisma.user.findFirst({ where: { email: requestBody.email } });
            if (!user)
                return response.status(404).send({ "info": "User not found" });
            const isPasswordCorrect = yield bcrypt_1.default.compare(requestBody.password, user.password);
            if (!isPasswordCorrect)
                return response.status(401).send({ "info": "Incorrect password" });
            const { password: _ } = user, userFiltered = __rest(user, ["password"]);
            const jwtToken = app.jwt.sign(userFiltered);
            return response.status(200).send({ "info": jwtToken });
        }));
        app.post("/validate", (request, response) => __awaiter(this, void 0, void 0, function* () {
            const requestBody = validate_body_zod_schema.parse(request.body);
            const tokenVerification = app.jwt.verify(requestBody.token);
            if (!tokenVerification)
                return response.status(401).send({ "info": false });
            return response.status(200).send({ "info": true });
        }));
    });
}
