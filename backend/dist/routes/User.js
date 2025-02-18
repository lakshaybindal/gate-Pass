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
const usermiddleware_1 = __importDefault(require("../middleware/usermiddleware"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const app = (0, express_1.default)();
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const date_fns_1 = require("date-fns");
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log(body);
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
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: "user already exists" });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const check = uservalidator_1.userSignin.safeParse(body);
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
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
}));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});
router.get("/me", usermiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findFirst({
            where: {
                id: req.userId,
            },
            select: {
                id: true,
                email: true,
                rollno: true,
                name: true,
                parentEmail: true,
                hostelName: true,
                parentAuth: true,
                adminAuth: true,
                parentAuthToken: true,
            },
        });
        return res.json({ user });
    }
    catch (e) {
        return res.status(400).json({ error: "Invalid user" });
    }
}));
router.post("/sendMail", usermiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log(body);
    const check = uservalidator_1.userMail.safeParse(body);
    console.log(check);
    if (!check.success) {
        return res.status(400).json({ error: "Invalid input" });
    }
    const parentEmail = yield prisma.user.update({
        where: {
            id: req.userId,
        },
        data: {
            parentAuthToken: crypto_1.default.randomBytes(3).toString("hex"),
            parentAuthExpiresAt: (0, date_fns_1.addHours)(new Date(), 3),
        },
        select: {
            parentAuthToken: true,
            parentEmail: true,
        },
    });
    const link = `http://localhost:5173/auth?token=${parentEmail === null || parentEmail === void 0 ? void 0 : parentEmail.parentAuthToken}`;
    try {
        yield transporter.sendMail({
            from: process.env.EMAIL,
            to: parentEmail === null || parentEmail === void 0 ? void 0 : parentEmail.parentEmail,
            subject: "Authentication Request",
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #333;">Leave Authentication Request</h2>
        <p style="font-size: 16px; color: #555;">Your ward has requested leave authentication. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>From Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${body.from}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>To Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${body.to}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Place to Go:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${body.place}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Reason:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${body.reason}</td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${link}" style="background-color: #007bff; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">
            Authenticate Now
          </a>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
        });
        return res.json({ message: "Mail sent" });
    }
    catch (e) {
        return res.status(400).json({ error: e, message: "Mail not sent" });
    }
}));
router.put("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ error: "Invalid token" });
    }
    try {
        const user = yield prisma.user.findFirst({
            where: {
                parentAuthToken: token,
            },
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid token" });
        }
        if (user.parentAuthExpiresAt && user.parentAuthExpiresAt < new Date()) {
            return res.status(400).json({
                error: "Token expired. Please request a new verification email.",
            });
        }
        yield prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                parentAuthToken: null,
                parentAuthExpiresAt: null,
                parentAuth: true,
            },
        });
        return res.json({ message: "Authenticated" });
    }
    catch (e) {
        return res.status(400).json({ error: "Invalid token" });
    }
}));
exports.default = router;
