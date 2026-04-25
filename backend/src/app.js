import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan("dev"));

const PORT = Number.parseInt(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running smoothly.');
});

app.listen(PORT, () => {
    console.log(`Server is live on http://localhost:${PORT}`);
});