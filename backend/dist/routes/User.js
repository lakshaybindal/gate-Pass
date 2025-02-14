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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const uservalidator_1 = require("../lib/validator/uservalidator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const app = (0, express_1.default)();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../env") });
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const check = uservalidator_1.userSignup.safeParse(body);
    if (!check.success) {
        return res.status(400).json({ error: "Invalid input" });
    }
    try {
        const user = yield prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                rollno: body.rollno,
                name: body.name,
                parentEmail: body.parentEmail,
                hostelName: body.hostelName,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.jwtsecret);
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: e });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const check = uservalidator_1.userSignin.safeParse(body);
    console.log(body);
    if (!check.success) {
        return res.status(400).json({ error: "Invalid input" });
    }
    try {
        const user = yield prisma.user.findFirst({
            where: {
                email: body.email,
                password: body.password,
            },
            select: {
                id: true,
                email: true,
            },
        });
        console.log(user);
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.jwtsecret);
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: "User already exists" });
    }
}));
exports.default = router;
