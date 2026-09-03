import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Salutem
          </Typography>
          <LogoutButton />
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
}
