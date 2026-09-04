import { isValidCPF, onlyDigits } from "@/lib/cpf";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type PatientInput = {
  name: string;
  cpf: string;
  birthDate: string; // AAAA-MM-DD
  phone?: string | null;
  email?: string | null;
  consent?: boolean;
};

/** Valida os campos de cadastro de paciente. Retorna mensagem de erro ou null se ok. */
export function validatePatientInput(input: PatientInput): string | null {
  if (typeof input.name !== "string" || input.name.trim().length < 3) {
    return "Nome completo é obrigatório";
  }

  if (typeof input.cpf !== "string" || !isValidCPF(input.cpf)) {
    return "CPF inválido";
  }

  if (typeof input.birthDate !== "string" || !DATE_RE.test(input.birthDate)) {
    return "Data de nascimento inválida";
  }
  const birthDate = new Date(input.birthDate);
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
    return "Data de nascimento inválida";
  }

  if (input.phone) {
    const digits = onlyDigits(input.phone);
    if (digits.length < 10 || digits.length > 11) {
      return "Telefone inválido";
    }
  }

  if (input.email && !EMAIL_RE.test(input.email)) {
    return "E-mail inválido";
  }

  return null;
}
