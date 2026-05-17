import { Worker } from "bullmq";
import { redisConnection } from "../../config/queue.js";
import {
  STUDENT_SYNC_JOB_NAME,
  STUDENT_SYNC_QUEUE_NAME,
} from "../queues/studentSync.queue.js";
import { studentSyncService } from "../../services/studentSync.service.js";

export const studentSyncWorker = new Worker(
  STUDENT_SYNC_QUEUE_NAME,
  async (job) => {
    if (job.name !== STUDENT_SYNC_JOB_NAME) {
      throw new Error(`Unsupported student sync job: ${job.name}`);
    }

    return studentSyncService.runLatestChunk(job.data ?? {});
  },
  {
    connection: redisConnection,
    concurrency: Number.parseInt(process.env.STUDENT_SYNC_CONCURRENCY, 10) || 1,
  },
);

studentSyncWorker.on("completed", (job, result) => {
  console.log(`Student sync job completed: ${job.id}`, result);
});

studentSyncWorker.on("failed", (job, error) => {
  console.log(`Student sync job failed: ${job?.id}`, error);
});

