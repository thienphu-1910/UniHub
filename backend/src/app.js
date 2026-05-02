import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config"
import cookieParser from "cookie-parser";

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

app.get('/', (req, res) => {
    res.send('Server is running smoothly.');
});

app.listen(PORT, () => {
    console.log(`Server is live on http://localhost:${PORT}`);
});

import { authRoute } from "./routes/auth.route.js";
import { workshopsRoute } from "./routes/workshops.route.js";
import { registrationsRoute } from "./routes/registrations.route.js";

app.use('/api', authRoute);
app.use('/api', workshopsRoute);
app.use('/api', registrationsRoute);