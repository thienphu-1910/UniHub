//Add conytroller for payment
import { addPaymentJob } from "../jobs/queues/payment.queue.js";
import { initiatePaymentSchema } from "../schemas/payment.schema.js";


export const initiatePayment = async (req, res) => {
    try {
        const { registrationId, amount, idempotencyKey } = initiatePaymentSchema.parse(req); 
        await addPaymentJob({ registrationId, amount, idempotencyKey });
        res.status(200).json({
            success: true,
            message: "Payment initiation successful. QR code will be generated shortly."
        });
    } catch (error) {
        console.error("Error initiating payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initiate payment. Please try again later."
        });
    }
};

