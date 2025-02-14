import express from "express";
import cors from "cors";
const app = express();
import AdminRouter from "./routes/Admin";
import UserRouter from "./routes/User";
import guardRouter from "./routes/Guard";
app.use(cors());
app.use(express.json());
app.use("/api/admin", AdminRouter);
app.use("/api/user", UserRouter);
app.use("/api/guard", guardRouter);
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
