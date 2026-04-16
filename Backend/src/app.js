import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApiError } from "./utils/ApiError.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";

import docsRouter from "./docs.routes.js";
import userRouter from "./routes/user.routes.js";
import eventTypeRouter from "./routes/eventType.routes.js";
import availabilityRouter from "./routes/availabilitySchedule.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import publicRouter from "./routes/public.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(requestLogger);

// Platform health checks (Render, etc.) commonly hit "/" with GET/HEAD.
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "scalar-scheduling-backend",
  });
});
app.head("/", (_req, res) => {
  res.sendStatus(200);
});
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/docs", docsRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/event-types", eventTypeRouter);
app.use("/api/v1/schedules", availabilityRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/public", publicRouter);

app.use((req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

app.use(errorHandler);

export { app };
