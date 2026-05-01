import { workshopsService } from "../services/workshops.service.js";

export const workshopsController = {
  addNewWorkshop: async (req, res) => {
    const payload = req.validatedData;

    try {
      const response = await workshopsService.addNewWorkshop(payload, req.user.userId);

      if (!response) return res.status(500).json({
        success: false,
        message: "Can not add new workshop",
      });
      
      return res.status(203).json({
        success: true,
        message: "Add new workshop successfully",
        data: {
          response
        }
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "Can not add new workshop"
      })
    }
  },

  getWorkshopList: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const response = await workshopsService.getWorkshopList(page, limit);
      return response;
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "Can not get workshop list"
      });
    }
  },

  getWorkshopDetail: async (req, res) => {
    const workshopId = req.query.id;

    try {
      const reponse = await workshopsService.getWorkshopDetail(workshopId);
      return response;
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "Can not get workshop detail",
      });
    }
  }
}