import { QueueEvents } from "bullmq";
import { redisConnection } from "../../config/queue.js";

const registrationEvent = new QueueEvents('registration', {
  connection: redisConnection,
});

const clients = new Map();

const onCompleted = async ({ returnvalue }) => {
  const { userId, workshopId, status } = returnvalue;
  const key = `${workshopId}:${userId}`;
  const res = clients.get(key);

  if (res) {
    res.write(`data: ${JSON.stringify({
      status
    })}\n\n`);    
  }

};

const onFailed = async ({ failedReason }) => {
  console.log(failedReason)
};

registrationEvent.on('completed', onCompleted);
registrationEvent.on('failed', onFailed);

export { registrationEvent, clients };
