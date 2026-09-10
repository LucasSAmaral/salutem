"use client";

import { signOut } from "next-auth/react";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { LogoutButtonRoot } from "./LogoutButton.styles";

export default function LogoutButton() {
  return (
    <LogoutButtonRoot
      color="inherit"
      size="small"
      startIcon={<LogoutOutlinedIcon fontSize="small" />}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sair
    </LogoutButtonRoot>
  );
}
