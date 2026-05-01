import { usersService } from "../services/users.service.js";
import { authService } from "../services/auth.service.js";
import jwt from "jsonwebtoken";

const cookiesOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: true,
  path: "/",
};

export const authController = {
  authenticateUser: async (req, res) => {
    try {
      const user = await usersService.getUserViaEmail(req.body.email);

      if (!user) {
        return res.status(401).json({
          message: "Can not authenticate!",
        });
      }

      const { accessToken, refreshToken, isAuthenticated } =
        await authService.authenticateUser(req.body.password, user);

      if (isAuthenticated === false) {
        return res.status(401).json({
          message: "Can not authenticate!",
        });
      }

      res.cookie("accessToken", accessToken, cookiesOptions);
      res.cookie("refresToken", refreshToken, cookiesOptions);

      return res.status(200).json({
        success: true,
        message: "Login successfully",
        data: {
          user: {
            fullName: user.fullName,
            role: user.role,
            studentId: user.studentId,
            email: user.email,
          },
        },
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  createToken: async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        status: "TOKEN_MISSING",
        message: "Token is missing",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

      const user = await usersService.getUserViaId(decoded.userId);
      const accessToken = jwt.sign(user, process.env.ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_EXP,
      });

      res.cookies("accessToken", accessToken, cookiesOptions);

      return res.status(200).json({
        success: true,
        message: "Create new access token",
      });
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "TOKEN_EXPIRED",
          message: "Token is expired",
        });
      }

      return res.status(401).json({
        status: "INVALID_TOKEN",
        message: "Invalid token",
      });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("accessToken", cookiesOptions);
      res.clearCookie("refreshToken", cookiesOptions);

      return res.status(200).json({
        success: true,
        message: "Logout successfully",
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: "Can not logout",
      });
    }
  },
};
