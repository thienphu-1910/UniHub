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
