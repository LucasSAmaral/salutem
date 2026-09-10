import { encode, decode, type JWT } from "next-auth/jwt";
import { cookies } from "next/headers";

export type PatientSessionPayload = {
  patientId: number;
  clinicId: number;
  clinicSlug: string;
};

const COOKIE_NAME = "patient_session";
// Sessão curta de propósito: a identificação (CPF + nascimento) é mais fraca
// que login com senha, então força reidentificação com frequência maior.
const MAX_AGE = 60 * 60 * 24; // 24h

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET não configurado");
  return secret;
}

export async function createPatientSession(payload: PatientSessionPayload): Promise<void> {
  // `types/next-auth.d.ts` amplia a interface global `JWT` com campos do
  // staff (role) pra tipar `lib/auth.ts` — não se aplica a paciente, daí o cast.
  const token = await encode({ token: payload as unknown as JWT, secret: getSecret(), maxAge: MAX_AGE });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getPatientSession(): Promise<PatientSessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = await decode({ token, secret: getSecret() });
  if (
    !decoded ||
    typeof decoded.patientId !== "number" ||
    typeof decoded.clinicId !== "number" ||
    typeof decoded.clinicSlug !== "string"
  ) {
    return null;
  }

  return { patientId: decoded.patientId, clinicId: decoded.clinicId, clinicSlug: decoded.clinicSlug };
}

export async function clearPatientSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
