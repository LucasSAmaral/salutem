"use client";

import { usePathname, useRouter } from "next/navigation";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import {
  BrandBlock,
  BrandName,
  ClinicName,
  LogoMark,
  LogoutIconButton,
  NavRow,
  NavTab,
  TopBarRoot,
} from "./PatientTopBar.styles";

export default function PatientTopBar({
  clinicSlug,
  clinicName,
  showLogout,
}: {
  clinicSlug: string;
  clinicName: string;
  showLogout: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/patient/auth", { method: "DELETE" });
    router.refresh();
  }

  const agendarHref = `/clinica/${clinicSlug}/agendar`;
  const meusAgendamentosHref = `/clinica/${clinicSlug}/meus-agendamentos`;

  return (
    <>
      <TopBarRoot>
        <LogoMark>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
            <path d="M12 3v18M3 12h18" />
          </svg>
        </LogoMark>
        <BrandBlock>
          <BrandName>Salutem</BrandName>
          <ClinicName>{clinicName}</ClinicName>
        </BrandBlock>
        {showLogout && (
          <LogoutIconButton onClick={handleLogout} aria-label="Sair" size="small">
            <LogoutOutlinedIcon fontSize="small" />
          </LogoutIconButton>
        )}
      </TopBarRoot>
      {showLogout && (
        <NavRow>
          <NavTab href={agendarHref} active={pathname === agendarHref}>
            Agendar
          </NavTab>
          <NavTab href={meusAgendamentosHref} active={pathname === meusAgendamentosHref}>
            Meus Agendamentos
          </NavTab>
        </NavRow>
      )}
    </>
  );
}
