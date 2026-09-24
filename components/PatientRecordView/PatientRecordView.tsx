"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { getInitials } from "@/lib/initials";
import { calculateAge, formatDateBR, formatDateShortBR } from "@/lib/formatDate";
import type { ConsultationEntry, ExamEntry, PatientRecord } from "@/lib/records";
import {
  AvatarLg,
  BackLink,
  ConsultBody,
  ConsultDate,
  ConsultItem,
  ConsultList,
  ConsultTitleRow,
  EditActions,
  ExamCard,
  ExamGrid,
  ExamsSection,
  FileIconBadge,
  PatientHeader,
  RestrictedIcon,
  RestrictedNote,
  SectionTitle,
  UploadCard,
} from "./PatientRecordView.styles";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export default function PatientRecordView({ initialRecord }: { initialRecord: PatientRecord }) {
  const { patient } = initialRecord;
  const [consultations, setConsultations] = useState(initialRecord.consultations);
  const [exams, setExams] = useState(initialRecord.exams);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [openingExamId, setOpeningExamId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function startEdit(c: ConsultationEntry) {
    setEditingId(c.appointmentId);
    setDraftNotes(c.notes ?? "");
    setNotesError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setNotesError(null);
  }

  async function saveNotes(appointmentId: number) {
    setSavingNotes(true);
    setNotesError(null);

    const res = await fetch(`/api/records/${patient.id}/consultations/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: draftNotes }),
    });
    setSavingNotes(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setNotesError(data.error ?? "Não foi possível salvar a anotação");
      return;
    }

    const saved = await res.json();
    setConsultations((prev) =>
      prev.map((c) => (c.appointmentId === appointmentId ? { ...c, notes: saved.notes } : c))
    );
    setEditingId(null);
  }

  async function openExam(exam: ExamEntry) {
    setOpeningExamId(exam.id);
    const res = await fetch(`/api/records/${patient.id}/exams/${exam.id}`);
    setOpeningExamId(null);

    if (!res.ok) {
      setUploadError("Não foi possível abrir o arquivo");
      return;
    }
    const { url } = await res.json();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleFileChosen(file: File) {
    setUploadError(null);

    if (!ACCEPTED_MIME.includes(file.type)) {
      setUploadError("Formato não suportado — envie PDF, JPEG, PNG ou WEBP");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("Arquivo muito grande (máx. 10MB)");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/records/${patient.id}/exams`, { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setUploadError(data.error ?? "Não foi possível enviar o exame");
      return;
    }

    const saved: ExamEntry = await res.json();
    setExams((prev) => [saved, ...prev]);
  }

  return (
    <>
      <Link href="/dashboard/records">
        <BackLink>
          <ArrowBackIcon fontSize="inherit" />
          Prontuário
        </BackLink>
      </Link>

      <RestrictedNote>
        <RestrictedIcon />
        Acesso restrito a médicos — essa abertura fica registrada no log de acesso (LGPD)
      </RestrictedNote>

      <PatientHeader variant="outlined">
        <AvatarLg>{getInitials(patient.name)}</AvatarLg>
        <Box>
          <Typography variant="body1">{patient.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            CPF {patient.cpf} · {calculateAge(new Date(patient.birthDate))} anos · nasc.{" "}
            {formatDateBR(new Date(patient.birthDate))}
          </Typography>
        </Box>
      </PatientHeader>

      <SectionTitle>Histórico de Consultas</SectionTitle>
      {consultations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Nenhuma consulta finalizada ainda.
        </Typography>
      ) : (
        <ConsultList variant="outlined">
          {consultations.map((c) => (
            <ConsultItem key={c.appointmentId}>
              <ConsultDate>{formatDateShortBR(new Date(c.date))}</ConsultDate>
              <ConsultBody>
                <ConsultTitleRow>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {c.doctor.name}
                  </Typography>
                  {c.isWalkIn && <Chip label="Encaixe" size="small" variant="outlined" />}
                  {c.canEdit && editingId !== c.appointmentId && (
                    <IconButton
                      size="small"
                      onClick={() => startEdit(c)}
                      aria-label="Editar anotação"
                    >
                      <EditOutlinedIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </ConsultTitleRow>

                {editingId === c.appointmentId ? (
                  <>
                    {notesError && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        {notesError}
                      </Alert>
                    )}
                    <TextField
                      value={draftNotes}
                      onChange={(e) => setDraftNotes(e.target.value)}
                      multiline
                      minRows={2}
                      fullWidth
                      size="small"
                      autoFocus
                    />
                    <EditActions>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={savingNotes}
                        onClick={() => saveNotes(c.appointmentId)}
                        startIcon={savingNotes ? <CircularProgress size={14} /> : undefined}
                      >
                        Salvar
                      </Button>
                      <Button size="small" onClick={cancelEdit} disabled={savingNotes}>
                        Cancelar
                      </Button>
                    </EditActions>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {c.notes || "Sem observações registradas."}
                  </Typography>
                )}
              </ConsultBody>
            </ConsultItem>
          ))}
        </ConsultList>
      )}

      <ExamsSection>
        <SectionTitle>Exames</SectionTitle>
        {uploadError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {uploadError}
          </Alert>
        )}
        <ExamGrid>
          {exams.map((exam) => (
            <ExamCard key={exam.id} variant="outlined" onClick={() => openExam(exam)}>
              <FileIconBadge>
                {openingExamId === exam.id ? (
                  <CircularProgress size={18} />
                ) : exam.fileType === "pdf" ? (
                  <DescriptionOutlinedIcon />
                ) : (
                  <ImageOutlinedIcon />
                )}
              </FileIconBadge>
              <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                {exam.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDateShortBR(new Date(exam.uploadedAt))} · {exam.uploadedBy.name}
              </Typography>
            </ExamCard>
          ))}

          <UploadCard variant="outlined" onClick={() => fileInputRef.current?.click()}>
            {uploading ? <CircularProgress size={20} /> : <UploadFileOutlinedIcon />}
            {uploading ? "Enviando…" : "Enviar novo exame"}
          </UploadCard>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) handleFileChosen(file);
            }}
          />
        </ExamGrid>
      </ExamsSection>
    </>
  );
}
