import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import { registrationController } from "../controllers/registration.controller.js";

const registrationRoute = express.Router();

registrationRoute.post(
  "/registrations",
  auth,
  registrationController.createRegistration,
);

export { registrationRoute };
