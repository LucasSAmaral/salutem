import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: Role;
    clinicId: number;
    clinicSlug: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      clinicId: number;
      clinicSlug: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    clinicId: number;
    clinicSlug: string;
  }
}
