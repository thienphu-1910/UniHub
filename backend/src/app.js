import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { authRoute } from "./routes/auth.route.js";
import { registrationRoute } from "./routes/registration.route.js";
import { workshopRoute } from "./routes/workshop.route.js";
import { checkinRoute } from "./routes/checkin.route.js";
import { paymentRoute } from "./routes/payment.route.js";
import { studentSyncRoute } from "./routes/studentSync.route.js";
import "./jobs/workers/workshopCache.worker.js";
import "./jobs/workers/registration.worker.js";
import "./jobs/workers/payment.worker.js";
import "./jobs/workers/studentSync.worker.js";
import { scheduleNightlyStudentSync } from "./jobs/queues/studentSync.queue.js";
import redis from "./config/redis.js";


const app = express();
const corsOptions = {
  origin: ["http://localhost:3000", "https://uni-hub-delta.vercel.app", "https://uni-5y1da16qf-thienphu-1910s-projects.vercel.app"],

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
app.use("/api", paymentRoute);
app.use("/api", checkinRoute);
app.use("/api", studentSyncRoute);

scheduleNightlyStudentSync().catch((error) => {
  console.log("Can not schedule nightly student sync", error);
});

app.listen(PORT, () => {
  console.log(`Server is live on http://localhost:${PORT}`);
});

// Đảm bảo redis client đã được connect thành công trước đó
async function deleteWorkshopKey(id) {
  try {
    const keyName = `workshop-${id}-info`;
    // Thực hiện xóa key
    const result = await redis.del([keyName]); 
    
    // Hàm del sẽ trả về số lượng key đã bị xóa (1 nếu xóa thành công, 0 nếu không tìm thấy key)
    if (result === 1) {
      console.log(`Xóa thành công key: ${keyName}`);
    } else {
      console.log(`Không tìm thấy key: ${keyName} để xóa`);
    }
  } catch (error) {
    console.error("Lỗi khi xóa key trên Redis Cloud:", error);
  }
}

// Gọi hàm khi cần, ví dụ:
await deleteWorkshopKey("a3674ca3-e6f3-4db4-8931-da188c595963");
