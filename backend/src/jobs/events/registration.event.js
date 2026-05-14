import { QueueEvents } from "bullmq";
import { redisConnection } from "../../config/queue.js";

const registrationEvent = new QueueEvents('registration', {
  connection: redisConnection,
});

// Để tạm hàm ở đây

const onCompleted = async ({ returnvalue}) => {
  
}

const onFailed = async ({ failedReason }) => {
  
}