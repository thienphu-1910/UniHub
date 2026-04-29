import express from "express";
import { authController } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.post('/signin', authController.authenticateUser);

export { authRoute };