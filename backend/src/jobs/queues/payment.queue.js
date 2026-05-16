import { Queue } from "bullmq"; 
import { redisConnection } from "../../config/queue.js";

export const paymentQueue = new Queue("paymentQueue", {
  connection: redisConnection,
});

export { paymentQueue };