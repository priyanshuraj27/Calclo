import { Router } from "express";
import { listPublicEventTypesForHost } from "../controllers/eventType.controllers.js";
import {
  getPublicEvent,
  getPublicSlots,
  createPublicBooking,
  getBookingConfirmation,
  cancelPublicBooking,
  reschedulePublicBooking,
} from "../controllers/publicBooking.controllers.js";

const router = Router();

router.route("/bookings/:bookingId/cancel").post(cancelPublicBooking);
router
  .route("/bookings/:bookingId/reschedule")
  .post(reschedulePublicBooking);
router.route("/bookings/:bookingId/confirmation").get(getBookingConfirmation);

router.route("/hosts/:hostUsername/event-types").get(listPublicEventTypesForHost);
router.route("/hosts/:hostUsername/events/:eventSlug").get(getPublicEvent);
router
  .route("/hosts/:hostUsername/events/:eventSlug/slots")
  .get(getPublicSlots);
router
  .route("/hosts/:hostUsername/events/:eventSlug/bookings")
  .post(createPublicBooking);

export default router;
