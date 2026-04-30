import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const authService = {
  authenticateUser: async (plainTextPassword, user) => {
    if (!user) return {
      isAuthenticated: false,
    }    

    const isUser = bcrypt.compareSync(plainTextPassword, user.password);
    if (isUser === false) return {
      isAuthenticated: false,
    }

    const payload = {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      studentId: user.studentId,
    };

    const refreshToken = jwt.sign(
      {
        userId: user.userId,
      },
      process.env.REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_EXP,
      },
    );

    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: ACCESS_EXP,
    });

    return {
      isAuthenticated: true,
      refreshToken,
      accessToken,
    }
  },
};
