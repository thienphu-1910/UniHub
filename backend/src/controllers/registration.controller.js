import { registrationService } from "../services/registration.service.js";
import { registrationEvent, clients } from "../jobs/events/registration.event.js";

export const registrationController = {
  createRegistration: async (req, res) => {
    try {
      const result = await registrationService.createRegistration({
        workshopId: req.params.workshopId,
        user: req.user,
      });

      console.log(result);

      if (!result.success) {
        return res.status(result.statusCode).json({
          success: result.success,
          code: result.code,
          message: result.message,
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
      res.write(`event: registration_status\n`);

      if (status) {
        res.write(`data: ${JSON.stringify({
          status
        })}\n\n`);        
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
  }
};
