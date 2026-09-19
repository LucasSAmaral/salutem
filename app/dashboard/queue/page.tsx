import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Typography } from "@mui/material";
import { authOptions } from "@/lib/auth";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { todayInClinic, todayLabelInClinic } from "@/lib/clinicTime";
import { getQueueSnapshot } from "@/lib/queue";
import { queueChannelName } from "@/lib/queueRealtime";
import QueueBoard from "@/components/QueueBoard/QueueBoard";
import { PageRoot, Subtitle } from "./page.styles";

export default async function QueuePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "DOCTOR" && session.user.role !== "ATTENDANT") {
    redirect("/dashboard");
  }

  const isDoctor = session.user.role === "DOCTOR";
  const doctor = isDoctor ? await getCurrentDoctor(session) : null;
  if (isDoctor && !doctor) redirect("/dashboard");

  const snapshot = await getQueueSnapshot(session.user.clinicId, todayInClinic(), {
    doctorId: doctor?.id,
    withExpected: !isDoctor,
  });
  const who = isDoctor ? session.user.name : "Todos os médicos";

  return (
    <PageRoot>
      <Typography variant="h5" gutterBottom>
        Fila de Atendimento
      </Typography>
      <Subtitle variant="body2" color="text.secondary">
        {who} · {todayLabelInClinic()}
      </Subtitle>

      <QueueBoard
        initialSnapshot={snapshot}
        channelName={queueChannelName(session.user.clinicId)}
        canManage={isDoctor}
        canConfirmArrival={!isDoctor}
      />
    </PageRoot>
  );
}
