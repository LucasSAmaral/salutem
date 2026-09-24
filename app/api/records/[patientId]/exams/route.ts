import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { EXAMS_BUCKET, examStoragePath, supabaseAdminClient } from "@/lib/supabaseAdmin";

const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
};
const MAX_BYTES = 10 * 1024 * 1024; // 10MB, igual o limite do bucket

/** Upload de um exame (PDF ou imagem) pro prontuário do paciente. Só DOCTOR;
 *  patient precisa ser da própria clínica. O arquivo vai direto pro bucket
 *  privado via service role — o client nunca fala com o Storage. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const doctor = await getCurrentDoctor(session);
  const { patientId: patientIdParam } = await params;
  const patientId = Number(patientIdParam);
  const clinicId = session.user.clinicId;
  const patient =
    doctor && Number.isInteger(patientId)
      ? await prisma.patient.findFirst({ where: { id: patientId, clinicId } })
      : null;
  if (!patient || !doctor) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const fileType = ALLOWED_MIME[file.type];
  if (!fileType) {
    return NextResponse.json(
      { error: "Formato não suportado — envie PDF, JPEG, PNG ou WEBP" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande (máx. 10MB)" }, { status: 400 });
  }

  const name = (form.get("name") as string | null)?.trim() || file.name;
  const path = examStoragePath(clinicId, patientId, file.name);

  const { error: uploadError } = await supabaseAdminClient.storage
    .from(EXAMS_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (uploadError) {
    console.error("[records] falha ao subir exame pro Storage", uploadError);
    return NextResponse.json({ error: "Falha ao enviar o arquivo" }, { status: 502 });
  }

  const exam = await prisma.exam.create({
    data: { name, filePath: path, fileType, patientId, clinicId, uploadedById: doctor.id },
  });

  return NextResponse.json({
    id: exam.id,
    name: exam.name,
    fileType: exam.fileType,
    uploadedAt: exam.uploadedAt.toISOString(),
    uploadedBy: { id: doctor.id, name: session.user.name },
  });
}
