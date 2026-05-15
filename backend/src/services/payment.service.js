import {paymentQueue} from "../jobs/queues/payment.queue.js";

import redis from "../config/redis";
import { paymentRepository } from "../repositories/payment.repository";

export const addPaymentJob = async({ registrationId, amount, idempotencyKey }) => {
    const isProcessed = await paymentQueue.get(`idempotency:${idempotencyKey}`);
    if (isProcessed) {
        console.log(`Payment with idempotency key ${idempotencyKey} has already been processed.`);
        return;
    }

    await redis.set(`idempotency:${idempotencyKey}`, "processing", {
        EX: 60 * 60, // Set expiration to 1 hour
    });

    await paymentQueue.add("process-payment", { registrationId, amount, idempotencyKey });
}

export const processWebhook = async (registrationId, status, gateway, txnId, rawResponse) => {
    const channel = `channel-${registrationId}`;
    if (status === "success") {
        paymentRepository.updatePaymentSuccess(registrationId, gateway, txnId, rawResponse);

        redis.publish(channel, JSON.stringify({
            type: "PAYMENT_SUCCESS",
            data: {
                registrationId,
                gateway,
                txnId,
                rawResponse
            }
        }));
    } else {
        paymentRepository.updatePaymentFailed(registrationId, gateway, txnId, rawResponse);

        redis.publish(channel, JSON.stringify({
            type: "PAYMENT_FAILED",
            data: {
                registrationId,
                gateway,
                txnId,
                rawResponse
            }
        }));
    }
};
