import { Router } from "express";
import { attachDefaultHostUser } from "../middlewares/auth.middleware.js";
import {
  createEventType,
  listMyEventTypes,
  getMyEventType,
  updateMyEventType,
  deleteMyEventType,
} from "../controllers/eventType.controllers.js";

const router = Router();
router.use(attachDefaultHostUser);

router.route("/").get(listMyEventTypes).post(createEventType);
router
  .route("/:eventTypeId")
  .get(getMyEventType)
  .patch(updateMyEventType)
  .delete(deleteMyEventType);

export default router;
