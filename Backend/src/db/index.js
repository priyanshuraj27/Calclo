
import { prisma } from "./prisma.js";

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected via Prisma");
  } catch (error) {
    console.log("PostgreSQL connection failed", error);
    process.exit(1);
  }
};

export default connectDB;