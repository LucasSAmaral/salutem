"use client";

import { signOut } from "next-auth/react";
import { Button } from "@mui/material";

export default function LogoutButton() {
  return (
    <Button color="inherit" onClick={() => signOut({ callbackUrl: "/login" })}>
      Sair
    </Button>
  );
}
