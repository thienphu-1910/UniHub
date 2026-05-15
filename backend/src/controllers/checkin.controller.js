import { checkinService } from "../services/checkin.service.js";

export const checkinController = {
  checkin: async (req, res) => {
    const { registrationId } = req.body;
    const staffId = req.user.userId;

    const workshopId = req.params.workshopId;

    try {
      const response = await checkinService.checkin({
        staffId,
        registrationId,
        workshopId,
      });
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
    const { checkinData } = req.body;
    const staffId = req.user.userId;
      
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
