import { Worker } from "bullmq";
import { redisConnection } from "../../config/queue.js";
import { encrypt } from "../../utils/crypto.js";
import { da } from "zod/v4/locales";
import {proccesWebhook} from "../../services/payment.service.js";

const handleJob = async (job) => {
  try {
    console.log("Processing payment for registration ID:", job.data.registrationId);
    // Simulate payment processing logic here
    const isPaymentSuccessful = Math.random() < 0.8; // 80% chance of success
    if (isPaymentSuccessful) {
        const gateway = "MockGateway";
        const gatewayTxnId = `txn_${Math.random().toString(36).substr(2, 9)}`;
        const gatewayResponse = JSON.stringify({ message: "Payment processed successfully" });
        const qrCodeData = encrypt(`registrationId:${job.data.registrationId}`);
        const quickChartUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrCodeData)}&size=300x300`;
        await proccesWebhook(job.data.registrationId, "success", gateway, gatewayTxnId, gatewayResponse);   
    } else {
        const gateway = "MockGateway";
        const gatewayResponse = JSON.stringify({ message: "Payment failed due to insufficient funds" });
        await proccesWebhook(job.data.registrationId, "failed", gateway, null, gatewayResponse);    
    }
    } catch (error) {
        console.error("Error processing payment job:", error);
    }
};

const paymentWorker = new Worker("paymentQueue", handleJob, {
  connection: redisConnection,
});

export default paymentWorker;
        
