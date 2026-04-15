import { Router } from "express";
import { attachDefaultHostUser } from "../middlewares/auth.middleware.js";
import {
  createSchedule,
  listMySchedules,
  getMySchedule,
  updateMySchedule,
  deleteMySchedule,
  addOverride,
  deleteOverride,
  listOverrides,
} from "../controllers/availabilitySchedule.controllers.js";

const router = Router();
router.use(attachDefaultHostUser);

router.route("/").get(listMySchedules).post(createSchedule);
router
  .route("/:scheduleId")
  .get(getMySchedule)
  .patch(updateMySchedule)
  .delete(deleteMySchedule);

router
  .route("/:scheduleId/overrides")
  .get(listOverrides)
  .post(addOverride);
router
  .route("/:scheduleId/overrides/:overrideId")
  .delete(deleteOverride);

export default router;
