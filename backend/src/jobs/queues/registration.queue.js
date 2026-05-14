import { redisConnection } from "../../config/queue.js"
import { Queue } from "bullmq"

const registrationQueue = new Queue('registration', {
  connection: redisConnection,
});

export const addRegistrationJob = async (job) => {
  await registrationQueue.add('add-registration', job);
}