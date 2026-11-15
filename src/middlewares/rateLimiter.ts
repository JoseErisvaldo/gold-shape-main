import rateLimit from "express-rate-limit";

const windowMs = 15 * 60 * 1000;

export const publicRateLimiter = rateLimit({
  windowMs,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Muitas requisições. Tente novamente em alguns minutos.",
  },
});

export const generalRateLimiter = rateLimit({
  windowMs,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/public"),
  message: {
    error: "Muitas requisições. Tente novamente em alguns minutos.",
  },
});
