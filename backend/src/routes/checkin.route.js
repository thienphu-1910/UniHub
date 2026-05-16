import express from "express";
import { checkRole, auth } from "../middleware/auth.middleware.js";
import { userRoles } from "../enums/role.enum.js";
import { checkinController } from "../controllers/checkin.controller.js";
import { apikeyMiddleware} from "../middleware/apikey.middleware.js"

const checkinRoute = express.Router();

checkinRoute.post(
  "/checkin/:workshopId",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.STAFF]),
  checkinController.checkin,
);

checkinRoute.post(
  "/checkin",
  apikeyMiddleware,
  auth,
  checkRole([userRoles.STAFF]),
  checkinController.synchronizeCheckinData,
);

export { checkinRoute };
