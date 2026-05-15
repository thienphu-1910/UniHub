import { paymentQueue } from "../jobs/queues/payment.queue.js";
import { redisConnection } from "../config/queue.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import { encrypt } from "../utils/crypto.js";

export const addPaymentJob = async ({ registrationId, amount, idempotencyKey }) => {
  const idempotencyRedisKey = `idempotency:${idempotencyKey}`;
  const isProcessed = await redisConnection.get(idempotencyRedisKey);

  if (isProcessed) {
    console.log(`Payment with idempotency key ${idempotencyKey} has already been processed.`);
    return false;
  }

  await redisConnection.set(idempotencyRedisKey, "processing", "EX", 60 * 60);

  await paymentQueue.add(
    "process-payment",
    { registrationId, amount, idempotencyKey },
    { jobId: idempotencyKey }
  );

  return true;
};

export const initiatePayment = async ({ registrationId, amount, idempotencyKey }) => {
  const queued = await addPaymentJob({ registrationId, amount, idempotencyKey });

  if (!queued) {
    throw new Error("Payment request has already been received");
  }

  return {
    registrationId,
    amount,
    idempotencyKey,
    status: "queued",
  };
};

export const processWebhook = async (
  registrationId,
  status,
  gateway,
  gatewayTxnId,
  rawResponse,
  qrCodeData = null,
  quickChartUrl = null
) => {
  const channel = `channel-${registrationId}`;

  if (status === "success") {
    const qrCodeData = encrypt(`${registrationId}`);
    const quickChartUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrCodeData)}&size=300x300`;

    await paymentRepository.updatePaymentSuccess({
      registrationId,
      gateway,
      gatewayTxnId,
      gatewayResponse: rawResponse,
      qrCodeData,
      quickChartUrl,
    });
    
    await redisConnection.publish(
      channel,
      JSON.stringify({
        type: "PAYMENT_SUCCESS",
        data: {
          registrationId,
          gateway,
          gatewayTxnId,
          rawResponse,
          qrCodeData,
          quickChartUrl,
        },
      })
    );
  } else {
    await paymentRepository.updatePaymentFailed({
      registrationId,
      gateway,
      gatewayResponse: rawResponse,
    });

    await redisConnection.publish(
      channel,
      JSON.stringify({
        type: "PAYMENT_FAILED",
        data: {
          registrationId,
          gateway,
          rawResponse,
        },
      })
    );
  }
};

export const paymentService = {
  initiatePayment,
  processWebhook,
};
