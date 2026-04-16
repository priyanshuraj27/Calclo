import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../db/prisma.js";
import { withMongoId } from "../utils/prismaNormalize.util.js";

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user._id },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      avatar: true,
      defaultTimezone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new ApiError(404, "User not found");
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched", withMongoId(user)));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, defaultTimezone, avatar } = req.body;
  if (!fullName && !email && !defaultTimezone && avatar === undefined) {
    throw new ApiError(400, "Provide at least one field to update");
  }
  const user = await prisma.user.update({
    where: { id: req.user._id },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(email !== undefined && { email: String(email).toLowerCase() }),
      ...(defaultTimezone !== undefined && { defaultTimezone }),
      ...(avatar !== undefined && { avatar }),
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      avatar: true,
      defaultTimezone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Account details updated", withMongoId(user)));
});

export { getCurrentUser, updateAccountDetails };
