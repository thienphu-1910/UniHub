import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { authRoute } from "./routes/auth.route.js";
import { registrationRoute } from "./routes/registration.route.js";

const app = express();
const corsOptions = {
  // 1. Chỉ cho phép origin cụ thể (Không được dùng '*')
  origin: "http://localhost:3000",

  // 2. Cho phép gửi kèm cookie, headers xác thực...
  credentials: true,

  // 3. Các method được phép
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  // 4. Các headers được phép từ phía client
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
};
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(cookieParser());

const PORT = Number.parseInt(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running smoothly.");
});

app.use("/api", authRoute);
app.use("/api", registrationRoute);

app.listen(PORT, () => {
  console.log(`Server is live on http://localhost:${PORT}`);
});

import { workshopsRoute } from "./routes/workshops.route.js";

app.use('/api', workshopsRoute);
