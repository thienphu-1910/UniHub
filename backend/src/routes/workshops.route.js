import express from "express";
import { workshopsController } from "../controllers/workshops.controller.js";
import { auth, checkRole } from "../middleware/auth.middleware.js";
import { apikeyMiddleware } from "../middleware/apikey.middleware.js";
import { workshopValidation } from "../middleware/validation.middleware.js";
import { userRoles } from "../enums/role.enum.js";
import { uploadMiddleware } from "../middleware/file.middleware.js";

const workshopsRoute = express.Router();

workshopsRoute.post(
  "/workshops",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER]),
  uploadMiddleware,
  workshopValidation,
  workshopsController.addNewWorkshop,
);

workshopsRoute.get(
  "/workshops",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER, userRoles.STUDENT]),
  workshopsController.getWorkshopList
);

workshopsRoute.get(
  "/workshops/:id",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER, userRoles.STUDENT]),
  workshopsController.getWorkshopDetail
);

export { workshopsRoute}