import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export class AuthorizationError extends Error {
  constructor(message = "Accès non autorisé.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireCompanyAdmin() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "COMPANY_ADMIN" || !session.user.companyId) {
    throw new AuthorizationError();
  }

  return {
    userId: session.user.id,
    companyId: session.user.companyId,
  };
}

export async function requireIntern() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "INTERN" || !session.user.internId) {
    throw new AuthorizationError();
  }

  return {
    userId: session.user.id,
    internId: session.user.internId,
  };
}
