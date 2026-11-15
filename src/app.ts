/// <reference path="./@types/express/index.d.ts" />
import type {} from "./@types/express/index";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import router from "./routes.js";
import {
  generalRateLimiter,
  publicRateLimiter,
} from "./middlewares/rateLimiter.js";
import { AppError } from "./utils/app-error.js";

if (
  process.env.MP_PIX_APPROVAL_TEST_MODE === "true" &&
  process.env.NODE_ENV === "production"
) {
  throw new Error("MP_PIX_APPROVAL_TEST_MODE não pode ser habilitado em produção");
}

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowVercelPreviews = process.env.CORS_ALLOW_VERCEL_PREVIEWS === "true";

const isAllowedVercelPreview = (origin: string) =>
  /^https:\/\/front-gold-shape-[a-z0-9-]+-jose-erisvaldo-dos-santos-projects\.vercel\.app$/.test(
    origin,
  );

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (allowVercelPreviews && isAllowedVercelPreview(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/public", publicRateLimiter);
app.use(generalRateLimiter);

app.use(express.json());
app.use(router);

app.use((error: Error, _: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  if (error instanceof Error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  return res.status(500).json({
    error: "Internal server error!",
  });
});

export default app;
