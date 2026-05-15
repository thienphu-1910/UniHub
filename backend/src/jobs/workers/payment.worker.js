import { Worker } from "bullmq";
import { redisConnection } from "../../config/queue.js";

//Mock
const paymentWorker = new Worker('PaymentQueue', async (job) => {
    try {
        const {registrationId, amount} = job.data;

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockPayemntURL = `https://payment-gateway.com/pay/${registrationId}`;

        const eventData = JSON.stringify({
            type: 'PAYMENT_QR_GENERATED',
            paymentURL: mockPayemntURL
        }); 
        
        await redisClient.publish(`registration:${registrationId}`, eventData);
        console.log(`Payment QR code generated for registration ${registrationId}: ${mockPayemntURL}`);

    } catch (error) {
        console.error(`Error processing payment for registration ${job.data.registrationId}:`, error);
        throw error;    
    }   
}, 
{
    connection: redisConnection,
});

export default paymentWorker;
        
