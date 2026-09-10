type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

/** Limitador simples em memória — vale só por instância do processo.
 *  Suficiente pra MVP (deploy single-instance); se o ECS escalar pra
 *  múltiplas tasks, isso deixa de ser efetivo e precisa migrar pra um
 *  contador compartilhado (Redis, ou uma tabela no Postgres). */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}
