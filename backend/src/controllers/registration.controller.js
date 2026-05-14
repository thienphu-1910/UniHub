import { registrationService } from "../services/registration.service.js";

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
