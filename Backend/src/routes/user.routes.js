import { Router } from "express";
import { getCurrentUser, updateAccountDetails } from "../controllers/user.controllers.js";
import { attachDefaultHostUser } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.use(attachDefaultHostUser);
userRouter.route("/current-user").get(getCurrentUser);
userRouter.route("/update-account").patch(updateAccountDetails);

export default userRouter;
