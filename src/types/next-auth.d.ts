import type { Role } from "@/generated/prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      companyId?: string | null;
      internId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    companyId?: string | null;
    internId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    companyId?: string | null;
    internId?: string | null;
  }
}
