import { paymentQueue } from "../jobs/queues/payment.queue.js";
import { redisConnection } from "../config/queue.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import { registrationRepository } from "../repositories/registration.repository.js";
import { encrypt } from "../utils/crypto.js";
import NotificationContext from "./notification/notificationContext.js";
import NodemailerStrategy from "./notification/nodemailerStrategy.js";
import { buildRegistrationSuccessEmail } from "./notification/emailTemplate.js";

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

    // publish to redis channel for realtime updates
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

    // Send email notification to student (best-effort)
    try {
      const details = await registrationRepository.getRegistrationWithDetails(registrationId);
      if (details && details.email) {
        const emailPayload = buildRegistrationSuccessEmail({
          fullName: details.fullName,
          workshopTitle: details.workshopTitle,
          room: details.room,
          quickChartUrl,
        });

        const context = new NotificationContext(new NodemailerStrategy());
        await context.send({
          to: details.email,
          subject: emailPayload.subject,
          html: emailPayload.html,
        });
      }
    } catch (e) {
      console.error("Failed to send registration email:", e);
    }
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
