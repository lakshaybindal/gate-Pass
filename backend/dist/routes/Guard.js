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
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const app = (0, express_1.default)();
const guardmiddleware_1 = __importDefault(require("../middleware/guardmiddleware"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const guardvalidator_1 = require("../lib/validator/guardvalidator");
exports.default = router;
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const check = guardvalidator_1.guardSignup.safeParse(body);
    if (!check.success) {
        return res.status(400).json({ error: "Invalid input" });
    }
    try {
        const guard = yield prisma.guard.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: guard.id }, process.env.JWT_SECRET);
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: "guard already exists" });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const check = guardvalidator_1.guardSignin.safeParse(body);
    if (!check.success) {
        return res.status(400).json({ error: "Invalid input" });
    }
    try {
        const guard = yield prisma.guard.findFirst({
            where: {
                email: body.email,
                password: body.password,
            },
            select: {
                id: true,
                email: true,
            },
        });
        if (!guard) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: guard.id }, process.env.JWT_SECRET);
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
}));
router.put("/done", guardmiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.id;
    try {
        yield prisma.user.update({
            where: {
                id: Number(userId),
            },
            data: {
                parentAuth: false,
                adminAuth: false,
            },
        });
    }
    catch (e) {
        return res.status(400).json({ error: "Invalid input" });
    }
    return res.json({ msg: "Done" });
}));
