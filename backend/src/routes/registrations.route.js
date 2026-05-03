import express from "express";
import { registrationsController } from "../controllers/registrations.controller.js";
import { apikeyMiddleware } from "../middleware/apikey.middleware.js";
import { auth, checkRole } from "../middleware/auth.middleware.js";
import { userRoles } from "../enums/role.enum.js";

const registrationsRoute = express.Router();

registrationsRoute.get(
  "/registrations/:workshopId",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER]),
  registrationsController.getAllWorkshopRegisteredStudent,
);

export { registrationsRoute };