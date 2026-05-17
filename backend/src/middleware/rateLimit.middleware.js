import { redisConnection } from "../config/queue.js";

const RATE_LIMIT_KEY_PREFIX = "ratebucket:registrations";
const TOKEN_BUCKET_CAPACITY = 10;
const TOKEN_REFILL_INTERVAL_MS = 5000; // mỗi 5 giây thêm 1 token
const TOKEN_REFILL_AMOUNT = 1;
const TOKEN_BUCKET_EXPIRE_SECONDS = 60 * 60; // 1 giờ

const tokenBucketLuaScript = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillInterval = tonumber(ARGV[2])
local refillAmount = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local expire = tonumber(ARGV[5])

local data = redis.call("HMGET", key, "tokens", "last")
local tokens = tonumber(data[1])
local last = tonumber(data[2])

if tokens == nil or last == nil then
  tokens = capacity
  last = now
end

local delta = now - last
if delta > 0 then
  local increments = math.floor(delta / refillInterval)
  if increments > 0 then
    tokens = math.min(capacity, tokens + increments * refillAmount)
    last = last + increments * refillInterval
  end
end

local allowed = 0
if tokens > 0 then
  tokens = tokens - 1
  allowed = 1
end

redis.call("HMSET", key, "tokens", tokens, "last", last)
redis.call("EXPIRE", key, expire)

return {allowed, tokens, last}
`;

export const registrationRateLimiter = async (req, res, next) => {
  const userId = req.user?.userId || req.user?.studentId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      code: "TOKEN_MISSING",
      message: "Authentication required for rate limiting",
    });
  }

  const key = `${RATE_LIMIT_KEY_PREFIX}:${userId}`;
  const now = Date.now();

  try {
    const [allowed] = await redisConnection.eval(
      tokenBucketLuaScript,
      1,
      key,
      TOKEN_BUCKET_CAPACITY,
      TOKEN_REFILL_INTERVAL_MS,
      TOKEN_REFILL_AMOUNT,
      now,
      TOKEN_BUCKET_EXPIRE_SECONDS,
    );

    if (allowed === 1 || allowed === "1") {
      return next();
    }

    return res.status(429).json({
      success: false,
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many registration attempts. Please wait before trying again.",
    });
  } catch (error) {
    console.error("Rate limiter error:", error);
    return res.status(500).json({
      success: false,
      code: "RATE_LIMIT_ERROR",
      message: "Unable to validate request rate limit.",
    });
  }
};
