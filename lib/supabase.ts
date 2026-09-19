import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Evento do Broadcast que avisa "a fila mudou". Deliberadamente sem payload
 *  com dado de paciente: o canal não tem autenticação por usuário (o NextAuth
 *  não emite token que o Supabase entenda), então quem recebe o aviso busca a
 *  fila de novo pela API autenticada, que filtra por clinicId. */
export const QUEUE_CHANGED_EVENT = "queue-changed";

let browserClient: SupabaseClient | null = null;

/** Cliente do Supabase pro navegador — usado só pra assinar canais de Realtime.
 *  Usa a publishable key (pública por design); as tabelas têm RLS ligado sem
 *  policy, então essa chave não lê nenhum dado do banco. */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return browserClient;
}
