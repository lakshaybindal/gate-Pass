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
const adminmiddleware_1 = __importDefault(require("../middleware/adminmiddleware"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminvalidator_1 = require("../lib/validator/adminvalidator");
exports.default = router;
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const check = adminvalidator_1.adminSignup.safeParse(body);
    if (!check.success) {
        return res.status(400).json({ error: "Invalid input" });
    }
    try {
        const admin = yield prisma.admin.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name,
                hostelName: body.hostelName,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: admin.id }, process.env.JWT_SECRET);
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: "Admin already exists" });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const check = adminvalidator_1.adminSignin.safeParse(body);
    if (!check.success) {
        return res.status(400).json({ error: "Invalid input" });
    }
    try {
        const admin = yield prisma.admin.findFirst({
            where: {
                email: body.email,
                password: body.password,
            },
            select: {
                id: true,
                email: true,
            },
        });
        if (!admin) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id }, process.env.JWT_SECRET);
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
}));
router.get("/getAll", adminmiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany({
        where: {
            parentAuth: true,
            adminAuth: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    return res.json({ users });
}));
router.put("/allow", adminmiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: "Invalid input" });
    }
    try {
        const user = yield prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                adminAuth: true,
            },
        });
    }
    catch (e) {
        return res.status(400).json({ error: "Invalid input" });
    }
    return res.json({ msg: "User allowed" });
}));
