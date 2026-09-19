import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { QUEUE_CHANGED_EVENT } from "@/lib/supabase";

/** Nome do canal de Broadcast da fila de uma clínica. Só pra uso no servidor:
 *  o sufixo é um HMAC do clinicId com o NEXTAUTH_SECRET, então o nome não é
 *  adivinhável a partir do id. O componente da fila recebe o nome pronto via
 *  props da page. */
export function queueChannelName(clinicId: number): string {
  const suffix = createHmac("sha256", process.env.NEXTAUTH_SECRET!)
    .update(`queue:${clinicId}`)
    .digest("hex")
    .slice(0, 16);
  return `queue-${clinicId}-${suffix}`;
}

const serverClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

/** Avisa os navegadores da clínica que a fila mudou. Vai por REST (`httpSend`),
 *  sem abrir websocket — serverless (Vercel) não mantém conexão. Best-effort:
 *  se o aviso falhar a mudança na fila já foi gravada, então só loga. */
export async function notifyQueueChanged(clinicId: number): Promise<void> {
  const channel = serverClient.channel(queueChannelName(clinicId));
  try {
    const result = await channel.httpSend(QUEUE_CHANGED_EVENT, {});
    if (!result.success) {
      console.error(`[queue] falha ao avisar Realtime (${result.status}): ${result.error}`);
    }
  } catch (err) {
    console.error("[queue] falha ao avisar Realtime", err);
  } finally {
    await serverClient.removeChannel(channel);
  }
}
