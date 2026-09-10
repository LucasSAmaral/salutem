import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar/Sidebar";
import LogoutButton from "@/components/LogoutButton/LogoutButton";
import { getNavItems } from "@/lib/navItems";
import { getInitials } from "@/lib/initials";
import { ContentArea, LayoutRoot, MainColumn, TopBar, UserAvatar } from "./layout.styles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const items = getNavItems(session.user.role);

  return (
    <LayoutRoot>
      <Sidebar items={items} clinicSlug={session.user.clinicSlug} />
      <MainColumn>
        <TopBar>
          <UserAvatar>{getInitials(session.user.name)}</UserAvatar>
          <LogoutButton />
        </TopBar>
        <ContentArea>{children}</ContentArea>
      </MainColumn>
    </LayoutRoot>
  );
}
