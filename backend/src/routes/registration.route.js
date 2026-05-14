import express from "express";
import { auth, checkRole } from "../middleware/auth.middleware.js";
import { apikeyMiddleware } from "../middleware/apikey.middleware.js";
import { registrationController } from "../controllers/registration.controller.js";
import { userRoles } from "../enums/role.enum.js";

const registrationRoute = express.Router();

registrationRoute.post(
  "/registrations/:workshopId",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.STUDENT]),
  registrationController.createRegistration,
);

registrationRoute.get(
  "/registrations/:workshopId",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER]),
  registrationController.getAllWorkshopRegisteredStudent,
);

export { registrationRoute };
