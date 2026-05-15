import { checkinService } from "../services/checkin.service.js";

export const checkinController = {
  checkin: async (req, res) => {
    const { staffId, registrationId } = req.body;

    const workshopId = req.params.workshopId;

    try {
      const response = await checkinService.checkin();
      if (response.success) return res.status(203).json(response);
      else return res.status(404).json(response);
    } catch (e) {
      return res.status(503).json({
        success: false,
        code: "SERVICE_UNAVAILABLE",
        message: "Can not checkin due to service unavailable",
      });
    }
  },
  synchronizeCheckinData: async (req, res) => {
    const { staffId, checkinData: checkinData } =
      req.body;
      
    try {
      const response = await checkinService.synchronizeCheckinData(staffId, checkinData);
      return res.status(200).json(response);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },
};
