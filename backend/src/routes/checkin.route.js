import express from "express";
import { checkRole, auth } from "../middleware/auth.middleware.js";
import { userRoles } from "../enums/role.enum.js";
import { checkinRepository } from "../repositories/checkin.repository.js";

const checkinRoute = express.Router();

checkRole.post(
  "/checkin/:workshopId",
  auth,
  checkRole([userRoles.STAFF]),
  checkinRepository.checkin,
);

checkRole.post(
  "/checkin/"
)

export { checkinRoute };
