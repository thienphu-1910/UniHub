import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { authRoute } from "./routes/auth.route.js";
import { registrationRoute } from "./routes/registration.route.js";
import { workshopRoute } from "./routes/workshop.route.js";
import { checkinRoute } from "./routes/checkin.route.js";

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

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
app.use("/api", workshopRoute);
app.use("/api", checkinRoute);

app.listen(PORT, () => {
  console.log(`Server is live on http://localhost:${PORT}`);
});



