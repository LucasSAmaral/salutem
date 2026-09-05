import type { Role } from "@prisma/client";

export type NavItemKey =
  | "dashboard"
  | "agenda"
  | "appointments"
  | "patients"
  | "queue"
  | "records"
  | "payment";

export type NavItem = {
  key: NavItemKey;
  label: string;
  /** null = tela ainda não implementada (item aparece desabilitado). */
  href: string | null;
};

/** Itens de navegação visíveis para cada papel, na ordem em que aparecem.
 *  `href: null` marca uma tela que só existe no design canvas por enquanto. */
export function getNavItems(role: Role): NavItem[] {
  const items: NavItem[] = [{ key: "dashboard", label: "Dashboard", href: "/dashboard" }];

  if (role === "ADMIN" || role === "DOCTOR") {
    items.push({
      key: "agenda",
      label: role === "ADMIN" ? "Agenda dos Médicos" : "Minha Agenda",
      href: "/dashboard/agenda",
    });
  }

  if (role === "ADMIN" || role === "ATTENDANT") {
    items.push({ key: "appointments", label: "Agendamento", href: "/dashboard/appointments" });
  }

  items.push({ key: "patients", label: "Pacientes", href: "/dashboard/patients" });

  if (role === "DOCTOR" || role === "ATTENDANT") {
    items.push({ key: "queue", label: "Fila de Atendimento", href: null });
  }

  if (role === "DOCTOR") {
    items.push({ key: "records", label: "Prontuário", href: null });
  }

  if (role === "ADMIN") {
    items.push({ key: "payment", label: "Pagamento", href: null });
  }

  return items;
}
