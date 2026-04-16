import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../db/prisma.js";
import { withMongoId } from "../utils/prismaNormalize.util.js";

/**
 * Single-host mode: no JWT. Every protected route runs as the user
 * named by DEFAULT_HOST_USERNAME (default: priyanshu). Run `npm run seed` first.
 */
export const attachDefaultHostUser = asyncHandler(async (req, _res, next) => {
  const username = (process.env.DEFAULT_HOST_USERNAME || "priyanshu")
    .toLowerCase()
    .trim();

  const user = await prisma.user.findUnique({
    where: { username },
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
  if (!user) {
    throw new ApiError(
      503,
      `No host user "${username}" in database. Run: npm run seed`
    );
  }

  req.user = withMongoId(user);
  next();
});
