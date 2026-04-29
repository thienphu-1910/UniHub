import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
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

app.use('/api', authRoute);