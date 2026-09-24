import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EXAMS_BUCKET, supabaseAdminClient } from "@/lib/supabaseAdmin";

const SIGNED_URL_TTL_SECONDS = 60;

/** URL assinada de curta duração pra abrir/baixar um exame — o bucket é
 *  privado, então não existe URL pública fixa pro arquivo. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string; examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { patientId: patientIdParam, examId: examIdParam } = await params;
  const patientId = Number(patientIdParam);
  const examId = Number(examIdParam);
  if (!Number.isInteger(patientId) || !Number.isInteger(examId)) {
    return NextResponse.json({ error: "Exame não encontrado" }, { status: 404 });
  }

  const exam = await prisma.exam.findFirst({
    where: { id: examId, patientId, clinicId: session.user.clinicId },
  });
  if (!exam) return NextResponse.json({ error: "Exame não encontrado" }, { status: 404 });

  const { data, error } = await supabaseAdminClient.storage
    .from(EXAMS_BUCKET)
    .createSignedUrl(exam.filePath, SIGNED_URL_TTL_SECONDS);
  if (error || !data) {
    console.error("[records] falha ao assinar URL do exame", error);
    return NextResponse.json({ error: "Falha ao gerar link do arquivo" }, { status: 502 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
