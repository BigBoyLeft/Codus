import { PrismaClient } from "@prisma/client";
import { logger } from "@lib/logger";

// export the prisma client as a singleton

export const prisma = new PrismaClient();

class Server {
  constructor() {
    logger.success("Server Starting");
  }
}

new Server();
