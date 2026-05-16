import z from "zod";
import { UpdatedWorkshopSchema, WorkshopSchema } from "../schemas/workshops.schema.js";

export const workshopValidation = (req, res, next) => {
  const payload = {
    ...req.body,
    speakerAvatar: req.files?.['avatar']?.[0] || null,
    pdfFile: req.files?.['pdf']?.[0] || null,
  }

  try {
    const workshopValidatedData = WorkshopSchema.parse(payload);    
    req.validatedData = workshopValidatedData;
    next();
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.log(e.issues);
      return res.status(400).json({
        sucess: false,
        message: "Invalid Data",
      })
    }
  }
}

export const updatedWorkshopValidation = (req, res, next) => {
  const payload = req.body.payload;

  try {
    const workshopValidatedData = UpdatedWorkshopSchema.parse(payload);
    req.validatedData = workshopValidatedData;
    next();
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.log(e.issues);
      return res.status(400).json({
        success: false,
        message: "Invalid Data"
      });
    }
  }
}