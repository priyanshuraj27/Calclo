import { Router } from "express";
import { attachDefaultHostUser } from "../middlewares/auth.middleware.js";
import {
  listMyBookings,
  cancelMyBooking,
  rescheduleMyBooking,
  updateBookingDuration,
  createMyBookingManageToken,
} from "../controllers/booking.controllers.js";

const router = Router();
router.use(attachDefaultHostUser);

router.route("/").get(listMyBookings);
router.route("/:bookingId/cancel").post(cancelMyBooking);
router.route("/:bookingId/reschedule").post(rescheduleMyBooking);
router.route("/:bookingId").patch(updateBookingDuration);
router.route("/:bookingId/manage-token").post(createMyBookingManageToken);

export default router;
