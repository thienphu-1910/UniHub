import { Redis } from "ioredis";
import { paymentService } from "../services/payment.service.js";
import { registrationService } from "../services/registration.service.js";

const sseSubscriber = new Redis({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

const channelClients = new Map();

sseSubscriber.on("message", (channel, message) => {
  const clients = channelClients.get(channel);
  if (!clients?.size) return;

  const payload = `data: ${message}\n\n`;
  for (const res of clients) {
    res.write(payload);
  }
});

export const paymentController = {
  initiatePayment: async (req, res) => {
    try {
      const { registrationId, amount, idempotencyKey } = req.body;

      if (!registrationId || !amount || !idempotencyKey) {
        return res.status(400).json({
          success: false,
          message: "registrationId, amount, and idempotencyKey are required",
        });
      }

      const result = await paymentService.initiatePayment({
        registrationId,
        amount,
        idempotencyKey,
      });

      return res.status(200).json({
        success: true,
        message: "Payment initiation queued successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  },

  handlePaymentWebhook: async (req, res) => {
    try {
      const { registrationId, status, gateway, txnId, rawResponse } = req.body;

      if (!registrationId || !status || !gateway || typeof rawResponse === "undefined") {
        return res.status(400).json({
          success: false,
          message: "registrationId, status, gateway and rawResponse are required",
        });
      }

      await paymentService.processWebhook(
        registrationId,
        status,
        gateway,
        txnId,
        rawResponse
      );

      return res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error) {
      console.error("Error processing payment webhook:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  },

  streamEvents: async (req, res) => {

    //Get QR code data for a registration if registration is confirmed
    const { registrationId } = req.params;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: "registrationId path parameter is required",
      });
    }

    const channel = `channel-${registrationId}`;

    //Send QR code data if Qr code is already generated for the registration in db
    const qrCodeData = await registrationService.getQRCodeData(registrationId);
    const quickChartUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrCodeData)}&size=300x300`;
    if (qrCodeData) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();
      const payload = `data: ${JSON.stringify({
        type: "PAYMENT_SUCCESS",
        data: {
          registrationId,
          qrCodeData,
          quickChartUrl,
        },
      })}\n\n`;
      res.write(payload);
      return res.end();
    }


    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const clients = channelClients.get(channel) || new Set();
    clients.add(res);
    channelClients.set(channel, clients);

    if (clients.size === 1) {
      await sseSubscriber.subscribe(channel);
    }

    const keepAlive = setInterval(() => {
      res.write(":\n\n");
    }, 20000);

    req.on("close", async () => {
      clearInterval(keepAlive);

      const existingClients = channelClients.get(channel);
      if (!existingClients) return;

      existingClients.delete(res);
      if (existingClients.size === 0) {
        channelClients.delete(channel);
        await sseSubscriber.unsubscribe(channel);
      }
    });
  },
};


    