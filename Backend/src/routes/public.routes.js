import { Router } from "express";
import { listPublicEventTypesForHost } from "../controllers/eventType.controllers.js";
import {
  getPublicEvent,
  getPublicSlots,
  createPublicBooking,
  getBookingConfirmation,
} from "../controllers/publicBooking.controllers.js";

const router = Router();

router.route("/hosts/:hostUsername/event-types").get(listPublicEventTypesForHost);
router.route("/hosts/:hostUsername/events/:eventSlug").get(getPublicEvent);
router
  .route("/hosts/:hostUsername/events/:eventSlug/slots")
  .get(getPublicSlots);
router
  .route("/hosts/:hostUsername/events/:eventSlug/bookings")
  .post(createPublicBooking);
router.route("/bookings/:bookingId/confirmation").get(getBookingConfirmation);

export default router;
