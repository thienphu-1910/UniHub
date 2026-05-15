import express from "express";
import { apikeyMiddleware } from "../middleware/apikey.middleware.js";
import { auth, checkRole } from "../middleware/auth.middleware.js";
import { userRoles } from "../enums/role.enum.js";
import { studentSyncController } from "../controllers/studentSync.controller.js";

const studentSyncRoute = express.Router();

studentSyncRoute.post(
  "/student-sync/run",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER]),
  studentSyncController.runStudentSync,
);

studentSyncRoute.get(
  "/student-sync/imports",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.ORGANIZER]),
  studentSyncController.getStudentSyncImports,
);

export { studentSyncRoute };

