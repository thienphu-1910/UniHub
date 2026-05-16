import { Queue } from "bullmq";
import { redisConnection } from "../../config/queue.js";

export const STUDENT_SYNC_QUEUE_NAME = "student-sync";
export const STUDENT_SYNC_JOB_NAME = "sync-latest-student-chunk";

export const studentSyncQueue = new Queue(STUDENT_SYNC_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 10_000,
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

export const addStudentSyncJob = async (payload = {}) =>
  studentSyncQueue.add(STUDENT_SYNC_JOB_NAME, payload, {
    jobId: payload.sourceFile
      ? `student-sync-manual-${Date.now()}`
      : `student-sync-latest-${Date.now()}`,
  });

export const scheduleNightlyStudentSync = async () => {
  const pattern = process.env.STUDENT_SYNC_CRON || "30 2 * * *";

  return studentSyncQueue.add(
    STUDENT_SYNC_JOB_NAME,
    {},
    {
      jobId: "student-sync-nightly",
      repeat: {
        pattern,
        tz: process.env.STUDENT_SYNC_TZ || "Asia/Ho_Chi_Minh",
      },
    },
  );
};

