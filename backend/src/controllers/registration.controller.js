import { registrationService } from "../services/registration.service.js";
import { registrationEvent, clients } from "../jobs/events/registration.event.js";

export const registrationController = {
  createRegistration: async (req, res) => {
    try {
      const result = await registrationService.createRegistration({
        workshopId: req.params.workshopId,
        user: req.user,
      });

      if (!result) {
        return res.status(409).json({
          success: false,
          code: "FULL_SLOTS",
          message: "There is no available slot",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Registration created successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },

  getWorkshopRegisteredStudents: async (req, res) => {
    const workshopId = req.params.workshopId;
    try {
      const response =
        await registrationService.getWorkshopRegisteredStudents(workshopId);
      return res.status(200).json({
        success: true,
        message: "Get all registered students successfully",
        data: {
          list: response,
        },
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e?.message || "",
      });
    }
  },

  getRegistrationStatus: async (req, res) => {
    const { userId } = req.body;
    const workshopId = req.params.workshopId;

    try {
      const status = await registrationService.getRegistrationStatus(
        workshopId,
        userId,
      );

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      if (status) {
        res.write(`data: ${JSON.stringify({
          status
        })}\n\n`);

        res.end();
      }

      const key = `${workshopId}:${userId}`;
      clients.set(key, res);

      req.on("close", () => {
        console.log("Client close connection!");
        clients.delete(key);
        res.end();
      });
      
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Database Unavailable",
      })
    }
  },

  getWorkshopConfirmedRegistration: async (req, res) => {
    const workshopId = req.params.workshopId;
    try {
      const registrations = registrationService.getWorkshopConfirmedRegistration(workshopId);
      return res.status(200).json({
        success: true,
        message: "Get registrations successfully",
        data: {
          registrations,
        }
      })
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Database Unavailable",
      });
    }
  },

  getQRCodeData: async (req, res) => {
    const workshopId = req.params.workshopId;
    try {
      const response = await registrationService.getQRCodeData(workshopId);
      return res.status(200).json({
        success: true,
        message: "Get QR code data successfully",
        data: {
          qrCodeData: response,
        }
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Database Unavailable",
      });
    }
  }
};
