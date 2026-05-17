const redisUsername = process.env.REDIS_USERNAME || "default";

export const bullMQConnection = {
  host: process.env.REDIS_HOST,
  port: Number.parseInt(process.env.REDIS_PORT, 10),
  username: redisUsername,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};
