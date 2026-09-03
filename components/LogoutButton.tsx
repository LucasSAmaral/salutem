"use client";

import { signOut } from "next-auth/react";
import { Button } from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

export default function LogoutButton() {
  return (
    <Button
      color="inherit"
      size="small"
      startIcon={<LogoutOutlinedIcon fontSize="small" />}
      onClick={() => signOut({ callbackUrl: "/login" })}
      sx={{ color: "text.secondary" }}
    >
      Sair
    </Button>
  );
}
