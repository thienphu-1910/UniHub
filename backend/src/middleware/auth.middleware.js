import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      code: "TOKEN_MISSING",
      message: "Token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Token is expired",
      });
    }

    return res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Invalid token",
    });
  }
};

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        code: "SERVER_ERROR",
        message: "Auth middleware must be called before checkRole",
      });
    }

    const user = req.user;
    if (allowedRoles.includes(user.role) === false) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "You have no permission to do this!"
      });
    }

    next();
  }
}