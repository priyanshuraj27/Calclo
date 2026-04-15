import { Router } from "express";
import { attachDefaultHostUser } from "../middlewares/auth.middleware.js";
import {
  listMyBookings,
  cancelMyBooking,
  rescheduleMyBooking,
} from "../controllers/booking.controllers.js";

const router = Router();
router.use(attachDefaultHostUser);

router.route("/").get(listMyBookings);
router.route("/:bookingId/cancel").post(cancelMyBooking);
router.route("/:bookingId/reschedule").post(rescheduleMyBooking);

export default router;
