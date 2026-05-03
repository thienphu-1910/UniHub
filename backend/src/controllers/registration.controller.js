import { registrationService } from "../services/registration.service.js";

export const registrationController = {
  createRegistration: async (req, res) => {
    try {
      const result = await registrationService.createRegistration({
        workshopId: req.body.workshopId,
        user: req.user,
      });

      if (!result.success) {
        return res.status(result.statusCode).json({
          success: false,
          code: result.code,
          message: result.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Registration created successfully",
        data: {
          registration: result.registration,
          paymentUrl: result.paymentUrl,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },

  getAllWorkshopRegisteredStudent: async (req, res) => {
    const workshopId = req.params.workshopId;
    try {
      const response =
        await registrationService.getAllWorkshopRegisteredStudent(workshopId);
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
};
