import { createClient } from "@supabase/supabase-js";

/** Cliente do Supabase com a service role — só pode ser importado em código de
 *  servidor (API routes, Server Components, scripts). Bypassa RLS e qualquer
 *  policy de bucket, igual o Prisma conecta como `postgres`: a autorização é
 *  toda feita em código, filtrando por clinicId (ver CLAUDE.md). Nunca expor
 *  esse client ou a chave ao navegador. */
export const supabaseAdminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const EXAMS_BUCKET = "exams";

/** Caminho do objeto no bucket de exames. Prefixado por clinicId e patientId
 *  pra isolar por clínica mesmo dentro de um bucket único (mesma lógica do
 *  Postgres compartilhado com clinicId em toda tabela). */
export function examStoragePath(clinicId: number, patientId: number, fileName: string): string {
  const safeName = fileName.replace(/[^\w.\-]+/g, "_");
  return `${clinicId}/${patientId}/${Date.now()}-${safeName}`;
}
