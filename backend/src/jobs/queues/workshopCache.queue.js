import { Queue } from "bullmq";
import { bullMQConnection } from "../../config/bullmq.js";

export const WORKSHOP_CACHE_QUEUE_NAME = "workshop-cache";
export const CACHE_WORKSHOP_FOR_REGISTRATION_JOB =
  "cache-workshop-for-registration";

const DEFAULT_CACHE_LEAD_MINUTES = 3;

export const WORKSHOP_CACHE_LEAD_TIME_MS =
  (Number.parseInt(process.env.WORKSHOP_CACHE_LEAD_MINUTES, 10) ||
    DEFAULT_CACHE_LEAD_MINUTES) *
  60 *
  1000;

export const workshopCacheQueue = new Queue(WORKSHOP_CACHE_QUEUE_NAME, {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5_000,
    },
    removeOnComplete: true,
    removeOnFail: 500,
  },
});

export const getWorkshopCacheDelayMs = (registrationStartTime) => {
  const cacheAt =
    new Date(registrationStartTime).getTime() - WORKSHOP_CACHE_LEAD_TIME_MS;

  return Math.max(cacheAt - Date.now(), 0);
};

export const scheduleWorkshopCacheJob = async ({
  workshopId,
  registrationStartTime,
}) => {
  if (!workshopId || !registrationStartTime) return null;

  return workshopCacheQueue.add(
    CACHE_WORKSHOP_FOR_REGISTRATION_JOB,
    { workshopId },
    {
      delay: getWorkshopCacheDelayMs(registrationStartTime),
      jobId: `workshop-cache-${workshopId}`,
    },
  );
};
