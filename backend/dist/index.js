"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const Admin_1 = __importDefault(require("./routes/Admin"));
const User_1 = __importDefault(require("./routes/User"));
const Guard_1 = __importDefault(require("./routes/Guard"));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/admin", Admin_1.default);
app.use("/api/user", User_1.default);
app.use("/api/guard", Guard_1.default);
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
