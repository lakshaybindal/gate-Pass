"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userAuth;
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../env") });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function userAuth(req, res, next) {
    const token = req.header("authorization");
    if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    }
    catch (e) {
        res.status(401).json({ error: "Unauthorized" });
    }
}
