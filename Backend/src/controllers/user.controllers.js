import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched", user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, defaultTimezone, avatar } = req.body;
  if (!fullName && !email && !defaultTimezone && avatar === undefined) {
    throw new ApiError(400, "Provide at least one field to update");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email: email.toLowerCase() }),
        ...(defaultTimezone !== undefined && { defaultTimezone }),
        ...(avatar !== undefined && { avatar }),
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "Account details updated", user));
});

export { getCurrentUser, updateAccountDetails };
