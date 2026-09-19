"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Tooltip, Typography } from "@mui/material";
import type { QueueEntry, QueueSnapshot } from "@/lib/queue";
import { supabaseBrowserClient, QUEUE_CHANGED_EVENT } from "@/lib/supabase";
import StatusChip from "@/components/StatusChip/StatusChip";
import {
  DoneIcon,
  EmptyState,
  GroupSection,
  GroupTitle,
  PatientInfo,
  PatientName,
  PositionBadge,
  QueueAlert,
  QueueRow,
  RowActions,
  SectionLabel,
} from "./QueueBoard.styles";

type QueueAction = "call" | "finish" | "skip";

type Group = {
  doctor: QueueEntry["doctor"];
  /** Em atendimento primeiro, depois quem aguarda por ordem da fila. */
  active: QueueEntry[];
  done: QueueEntry[];
};

type Feedback = { error: string | null; notice: string | null };

const NO_FEEDBACK: Feedback = { error: null, notice: null };
const ACTION_ERROR = "Não foi possível atualizar a fila. Tente novamente.";

const byQueueOrder = (a: QueueEntry, b: QueueEntry): number =>
  Number(b.status === "EM_ATENDIMENTO") - Number(a.status === "EM_ATENDIMENTO") ||
  a.position - b.position;

function groupByDoctor(entries: readonly QueueEntry[]): Group[] {
  return [...new Set(entries.map((entry) => entry.doctor.id))].map((doctorId) => {
    const mine = entries.filter((entry) => entry.doctor.id === doctorId);
    return {
      doctor: mine[0].doctor,
      active: mine.filter((entry) => entry.status !== "ATENDIDO").toSorted(byQueueOrder),
      done: mine.filter((entry) => entry.status === "ATENDIDO"),
    };
  });
}

/** Último agendado e último presente podem ser pessoas diferentes (quando o
 *  último agendado ainda não chegou); só vira "Último do dia" quando coincidem. */
const lastOfDayLabels = (entry: QueueEntry): string[] =>
  entry.isLastScheduled && entry.isLastPresent
    ? ["Último do dia"]
    : [
        ...(entry.isLastScheduled ? ["Último agendado"] : []),
        ...(entry.isLastPresent ? ["Último presente"] : []),
      ];

const scheduleLabel = (entry: QueueEntry): string =>
  `${entry.isWalkIn ? "encaixe" : "agendado"} ${entry.scheduledTime}`;

/** Busca a fila. Nunca lança: sem rede/erro devolve null e a tela mantém o que já tem. */
async function fetchQueue(): Promise<QueueSnapshot | null> {
  try {
    const res = await fetch("/api/queue");
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** Manda a ação pro servidor e devolve o que mostrar ao usuário. Nunca lança. */
async function requestAction(entryId: number, action: QueueAction): Promise<Feedback> {
  try {
    const res = await fetch(`/api/queue/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error ?? ACTION_ERROR, notice: null };
    return {
      error: null,
      notice: data.next?.patientName ? `Próximo paciente chamado: ${data.next.patientName}` : null,
    };
  } catch {
    return { error: ACTION_ERROR, notice: null };
  }
}

export default function QueueBoard({
  initialSnapshot,
  channelName,
  canManage,
}: {
  initialSnapshot: QueueSnapshot;
  channelName: string;
  /** Só o médico chama, finaliza e pula; a atendente apenas acompanha. */
  canManage: boolean;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState(NO_FEEDBACK);

  const refresh = useCallback(async (): Promise<void> => {
    const fresh = await fetchQueue();
    // Resposta velha chegando depois de uma mais nova não sobrescreve a nova.
    if (fresh) setSnapshot((current) => (fresh.asOf > current.asOf ? fresh : current));
  }, []);

  useEffect(() => {
    const channel = supabaseBrowserClient
      .channel(channelName)
      .on("broadcast", { event: QUEUE_CHANGED_EVENT }, () => {
        void refresh();
      })
      .subscribe((status) => {
        // Também no reconnect: cobre avisos perdidos enquanto estava desconectado.
        if (status === "SUBSCRIBED") void refresh();
      });

    return () => {
      void supabaseBrowserClient.removeChannel(channel);
    };
  }, [channelName, refresh]);

  async function act(entry: QueueEntry, action: QueueAction): Promise<void> {
    setBusyId(entry.id);
    setFeedback(NO_FEEDBACK);
    const outcome = await requestAction(entry.id, action);
    // Aviso e lista mudam juntos, e a linha só é liberada depois de a fila
    // atualizar: até lá ela mostra o estado antigo e um segundo clique agiria
    // sobre um paciente que já mudou.
    await refresh();
    setFeedback(outcome);
    setBusyId(null);
  }

  const groups = groupByDoctor(snapshot.entries);

  if (groups.length === 0) {
    return <EmptyState color="text.secondary">Nenhum paciente na fila hoje.</EmptyState>;
  }

  return (
    <>
      {feedback.error && (
        <QueueAlert severity="error" onClose={() => setFeedback((f) => ({ ...f, error: null }))}>
          {feedback.error}
        </QueueAlert>
      )}
      {feedback.notice && (
        <QueueAlert severity="info" onClose={() => setFeedback((f) => ({ ...f, notice: null }))}>
          {feedback.notice}
        </QueueAlert>
      )}

      {groups.map((group) => {
        const someoneInProgress = group.active.some((e) => e.status === "EM_ATENDIMENTO");
        const someoneWaiting = group.active.some((e) => e.status === "AGUARDANDO");

        return (
          <GroupSection key={group.doctor.id}>
            {!canManage && <GroupTitle variant="body1">{group.doctor.name}</GroupTitle>}

            {group.active.map((entry, index) => {
              const inProgress = entry.status === "EM_ATENDIMENTO";
              const busy = busyId === entry.id;

              return (
                <QueueRow key={entry.id} highlighted={inProgress}>
                  <PositionBadge highlighted={inProgress}>{index + 1}</PositionBadge>
                  <PatientInfo>
                    <PatientName variant="body2">{entry.patient.name}</PatientName>
                    <Typography variant="caption" color="text.secondary">
                      {scheduleLabel(entry)}
                    </Typography>
                  </PatientInfo>

                  <RowActions>
                    {entry.isWalkIn && <StatusChip status="WALK_IN" />}
                    {lastOfDayLabels(entry).map((label) => (
                      <StatusChip key={label} status="LAST_OF_DAY" label={label} />
                    ))}
                    {inProgress ? (
                      <StatusChip status="IN_PROGRESS" />
                    ) : (
                      <StatusChip status="CONFIRMED" label="Aguardando" />
                    )}

                    {canManage && inProgress && (
                      <>
                        <Tooltip title="O paciente não estava na sala: passa a vez pro próximo">
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={busy}
                              onClick={() => act(entry, "skip")}
                            >
                              Pular
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            someoneWaiting
                              ? "Finaliza e já chama o próximo da fila"
                              : "Finaliza o atendimento"
                          }
                        >
                          <span>
                            <Button
                              size="small"
                              variant="contained"
                              disabled={busy}
                              onClick={() => act(entry, "finish")}
                            >
                              Finalizar
                            </Button>
                          </span>
                        </Tooltip>
                      </>
                    )}

                    {canManage && !inProgress && (
                      <Tooltip
                        title={
                          someoneInProgress ? "Finalize o atendimento em andamento primeiro" : ""
                        }
                      >
                        <span>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={busy || someoneInProgress}
                            onClick={() => act(entry, "call")}
                          >
                            Chamar
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </RowActions>
                </QueueRow>
              );
            })}

            {group.done.length > 0 && (
              <>
                <SectionLabel variant="body2" color="text.secondary">
                  Atendidos hoje
                </SectionLabel>
                {group.done.map((entry) => (
                  <QueueRow key={entry.id} dimmed>
                    <PositionBadge>
                      <DoneIcon />
                    </PositionBadge>
                    <PatientInfo>
                      <PatientName variant="body2">{entry.patient.name}</PatientName>
                      <Typography variant="caption" color="text.secondary">
                        {scheduleLabel(entry)}
                      </Typography>
                    </PatientInfo>
                    <RowActions>
                      <StatusChip status="DONE" />
                    </RowActions>
                  </QueueRow>
                ))}
              </>
            )}
          </GroupSection>
        );
      })}
    </>
  );
}
