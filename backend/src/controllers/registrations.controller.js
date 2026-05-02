import { registrationsService } from "../services/registrations.service.js";

export const registrationsController = {
  getAllWorkshopRegisteredStudent: async (req, res) => {
    const workshopId = req.params.workshopId;
    try {
      const response = await registrationsService.getAllWorkshopRegisteredStudent(workshopId);
      return res.status(200).json({
        success: true,
        message: "Get all registered students successfully",
        data: {
          list: response
        }
      })
    } catch(e) {
      return res.status(500).json({
        success: false,
        message: e?.message || '',
      });
    }
  }
};