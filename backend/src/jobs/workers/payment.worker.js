import { Worker } from "bullmq";
import { redisConnection } from "../../config/queue.js";
import { encrypt } from "../../utils/crypto.js";
import { processWebhook } from "../../services/payment.service.js";

const handleJob = async (job) => {
  try {
    console.log("Processing payment for registration ID:", job.data.registrationId);
    const isPaymentSuccessful = Math.random() < 0.99999999;

    const gateway = "MockGateway";
    const gatewayResponse = isPaymentSuccessful
      ? JSON.stringify({ message: "Payment processed successfully" })
      : JSON.stringify({ message: "Payment failed due to insufficient funds" });

    if (isPaymentSuccessful) {
      const gatewayTxnId = `txn_${Math.random().toString(36).substr(2, 9)}`;
      const qrCodeData = encrypt(`registrationId:${job.data.registrationId}`);
      const quickChartUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrCodeData)}&size=300x300`;

      await processWebhook(
        job.data.registrationId,
        "success",
        gateway,
        gatewayTxnId,
        gatewayResponse,
        qrCodeData,
        quickChartUrl
      );
    } else {
      await processWebhook(
        job.data.registrationId,
        "failed",
        gateway,
        null,
        gatewayResponse
      );
    }
  } catch (error) {
    console.error("Error processing payment job:", error);
  }
};

const paymentWorker = new Worker("paymentQueue", handleJob, {
  connection: redisConnection,
});

export default paymentWorker;
        
