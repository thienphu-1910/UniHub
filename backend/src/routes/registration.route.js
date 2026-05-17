import express from "express";
import { auth, checkRole } from "../middleware/auth.middleware.js";
import { apikeyMiddleware } from "../middleware/apikey.middleware.js";
import { registrationRateLimiter } from "../middleware/rateLimit.middleware.js";
import { registrationController } from "../controllers/registration.controller.js";
import { userRoles } from "../enums/role.enum.js";

const registrationRoute = express.Router();

registrationRoute.post(
  "/registrations/:workshopId",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.STUDENT]),
  registrationRateLimiter,
  registrationController.createRegistration,
);

registrationRoute.get(
  "/registrations/:workshopId",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER]),
  registrationController.getWorkshopRegisteredStudents,
);

registrationRoute.get(
  "/registration/:workshopId/status",
  auth,
  checkRole([userRoles.STUDENT]),
  registrationController.getRegistrationStatus
);

registrationRoute.get(
  "registrations/:workshopId/confirmation",
  auth, 
  checkRole([userRoles.STAFF]),
  registrationController.getWorkshopConfirmedRegistration
)

registrationRoute.get(
  "/registrations/:workshopId/qrcode",
  auth,
  checkRole([userRoles.STUDENT]),
  registrationController.getQRCodeData
);

export { registrationRoute };
