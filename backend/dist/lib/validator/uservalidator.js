"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMail = exports.userSignin = exports.userSignup = void 0;
const zod_1 = __importDefault(require("zod"));
exports.userSignup = zod_1.default.object({
    name: zod_1.default.string(),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6),
    parentEmail: zod_1.default.string().email(),
    rollno: zod_1.default.string(),
    hostelName: zod_1.default.string(),
});
exports.userSignin = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6),
});
exports.userMail = zod_1.default.object({
    from: zod_1.default.string(),
    to: zod_1.default.string(),
    place: zod_1.default.string(),
    reason: zod_1.default.string(),
});
