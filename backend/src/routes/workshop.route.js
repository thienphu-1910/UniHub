import express from "express";
import { workshopController } from "../controllers/workshop.controller.js";
import { auth, checkRole } from "../middleware/auth.middleware.js";
import { apikeyMiddleware } from "../middleware/apikey.middleware.js";
import { workshopValidation, updatedWorkshopValidation } from "../middleware/validation.middleware.js";
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

workshopRoute.patch(
  "/workshops/:id",
  auth,
  checkRole([userRoles.ORGANIZER]),
  updatedWorkshopValidation,
  workshopController.updateWorkshop
)

workshopRoute.get(
  "/workshops/:id",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER, userRoles.STUDENT]),
  workshopController.getWorkshopDetail
);

workshopRoute.delete(
  "/workshops/:id",
  auth,
  checkRole([userRoles.ORGANIZER]),
  workshopController.deactivatingWorkshop
);

export { workshopRoute }