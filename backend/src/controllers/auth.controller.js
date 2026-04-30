import { usersService } from "../services/users.service.js";
import { authService } from "../services/auth.service.js";

export const authController = {
  authenticateUser: async (req, res) => {
    try {
      const user = await usersService.getUserViaEmail(req.body.email);

      if (!user) {
        return res.status(401).json({
          message: "Can not authenticate!",
        });
      }

      const {
        accessToken,
        refreshToken,
        isAuthenticated,
      } = await authService.authenticateUser(req.body.password, user);

      if (isAuthenticated === false) {
        return res.status(401).json({
          message: "Can not authenticate!",
        });
      }

      const options = {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        path: "/",
      };

      res.cookie('accessToken', accessToken, options);
      res.cookie('refresToken', refreshToken, options);

      return res.status(200).json({
        success: true,
        message: "Login successfully",
        data: {
          user: {
            fullName: user.fullName,
            role: user.role,
            studentId: user.studentId,
            email: user.email,
          }
        }
      })
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  createToken: async (req, res) => {
    
  }
}