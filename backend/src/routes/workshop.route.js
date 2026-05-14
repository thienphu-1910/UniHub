import express from "express";
import { workshopController } from "../controllers/workshop.controller.js";
import { auth, checkRole } from "../middleware/auth.middleware.js";
import { apikeyMiddleware } from "../middleware/apikey.middleware.js";
import { workshopValidation } from "../middleware/validation.middleware.js";
import { userRoles } from "../enums/role.enum.js";
import { uploadMiddleware } from "../middleware/file.middleware.js";

const workshopRoute = express.Router();

workshopRoute.post(
  "/workshops",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER]),
  uploadMiddleware,
  workshopValidation,
  workshopController.addNewWorkshop,
);

workshopRoute.get(
  "/workshops",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER, userRoles.STUDENT]),
  workshopController.getWorkshopList
);

workshopRoute.get(
  "/workshops/:id",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER, userRoles.STUDENT]),
  workshopController.getWorkshopDetail
);

export { workshopRoute }