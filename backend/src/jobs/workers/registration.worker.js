import { redisConnection } from "../../config/queue.js";
import { Worker } from "bullmq";
import { registrationRepository } from "../../repositories/registration.repository.js";
import redis from "../../config/redis.js";

const handleJob = async (job) => {
  try {
    const response = await registrationRepository.createRegistration(job.data);
    const { holdkey } = job.data;
    await redis.del([holdkey]);
    return response;

  } catch (e) {
    throw e;
  }

  return response;
};

const registrationWorker = new Worker("registration", handleJob, {
  connection: redisConnection,
});
