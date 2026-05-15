import { Queue } from "bullmq"; 
import { redisConnection } from "../../config/queue.js";

const paymentQueue = new Queue("paymentQueue", {
  connection: redisConnection,
});

export { paymentQueue };