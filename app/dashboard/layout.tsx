import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Box } from "@mui/material";
import Sidebar from "@/components/Sidebar";
import LogoutButton from "@/components/LogoutButton";
import { getNavItems } from "@/lib/navItems";
import { getInitials } from "@/lib/initials";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const items = getNavItems(session.user.role);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar items={items} clinicSlug={session.user.clinicSlug} />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            height: 64,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1.5,
            px: 4,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: "primary.light",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {getInitials(session.user.name)}
          </Box>
          <LogoutButton />
        </Box>
        <Box sx={{ flex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}
