import { Worker } from "bullmq";
import { bullMQConnection } from "../../config/bullmq.js";
import { workshopRepository } from "../../repositories/workshop.repository.js";
import { workshopCacheService } from "../../services/workshopCache.service.js";
import {
  CACHE_WORKSHOP_FOR_REGISTRATION_JOB,
  WORKSHOP_CACHE_QUEUE_NAME,
} from "../queues/workshopCache.queue.js";

export const workshopCacheWorker = new Worker(
  WORKSHOP_CACHE_QUEUE_NAME,
  async (job) => {
    if (job.name !== CACHE_WORKSHOP_FOR_REGISTRATION_JOB) {
      throw new Error(`Unsupported workshop cache job: ${job.name}`);
    }

    const workshop = await workshopRepository.getWorkshopForCache(
      job.data.workshopId,
    );

    if (!workshop) {
      throw new Error(`Workshop not found: ${job.data.workshopId}`);
    }

    return workshopCacheService.cacheWorkshopForRegistration(workshop);
  },
  {
    connection: bullMQConnection,
    concurrency:
      Number.parseInt(process.env.WORKSHOP_CACHE_WORKER_CONCURRENCY, 10) || 5,
  },
);

workshopCacheWorker.on("completed", (job) => {
  console.log(`Workshop cache job completed: ${job.id}`);
});

workshopCacheWorker.on("failed", (job, error) => {
  console.log(`Workshop cache job failed: ${job?.id}`, error);
});
