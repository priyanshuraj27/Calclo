import { Router } from "express";

const docsRouter = Router();

docsRouter.route("/").get((_req, res) => {
  res.status(200).json({
    name: "Scalar Scheduling API",
    version: "1.0.0",
    basePath: "/api/v1",
    auth: "Single-host mode (no JWT). Protected routes use DEFAULT_HOST_USERNAME; run npm run seed first.",
    resources: [
      "/users",
      "/event-types",
      "/schedules",
      "/bookings",
      "/public",
    ],
  });
});

export default docsRouter;
