export const apikeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({
      code: "API_KEY_MISSING",
      message: "API key is missing",
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      code: "API_KEY_INVALID",
      message: "Invalid API key",
    });
  }

  next();
}