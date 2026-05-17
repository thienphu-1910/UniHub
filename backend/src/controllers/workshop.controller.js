import { response } from "express";
import { workshopService } from "../services/workshop.service.js";

export const workshopController = {
  addNewWorkshop: async (req, res) => {
    const payload = req.validatedData;

    try {
      const response = await workshopService.addNewWorkshop(payload, req.user.userId);

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
      const response = await workshopService.getWorkshopList(page, limit);
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "Can not get workshop list"
      });
    }
  },

  getWorkshopDetail: async (req, res) => {
    const workshopId = req.params.id;

    try {
      const response = await workshopService.getWorkshopDetail(workshopId);
      return res.status(200).json({
        success: true,
        message: "Get workshop detail successfully",
        data: {
          workshop: response,
        }
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "Can not get workshop detail",
      });
    }
  },

  updateWorkshop: async (req, res) => {
    const payload = req.validatedData;
    const id = req.params.id;
    try {
      const result = await workshopService.updateWorkshop(id, payload);

      return res.status(200).json({
        success: true,
        message: "Update Workshop Successfully",
        data: {
          data: result,
        }
      })
    } catch (e) {
      console.log(e)
      return res.status(500).json({
        sucess: false,
        message: e.message,
      })
    }
  },
  deactivatingWorkshop: async (req, res) => {
    const id = req.params.id;
    try {
      await workshopService.deactivatingWorkshop(id);
      return res.status(200).json({
        success: true,
        message: "Deactivating successfully",
      })
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message ?? ""
      })
    }
  }
}