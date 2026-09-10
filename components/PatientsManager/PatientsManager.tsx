"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CheckIcon from "@mui/icons-material/Check";
import type { Patient } from "@prisma/client";
import { getInitials } from "@/lib/initials";
import { formatDateBR } from "@/lib/formatDate";
import { onlyDigits } from "@/lib/cpf";
import PatientFormDialog from "@/components/PatientFormDialog/PatientFormDialog";
import DeletePatientDialog from "@/components/DeletePatientDialog/DeletePatientDialog";
import {
  AvatarCircle,
  EmptyStateText,
  HeaderRow,
  PatientNameCell,
  SearchField,
  SearchIconMuted,
} from "./PatientsManager.styles";

export default function PatientsManager({ initialPatients }: { initialPatients: Patient[] }) {
  const [patients, setPatients] = useState(initialPatients);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  function openCreate() {
    setEditingPatient(null);
    setFormOpen(true);
  }

  function openEdit(p: Patient) {
    setEditingPatient(p);
    setFormOpen(true);
  }

  function handleSaved(saved: Patient, wasEditing: boolean) {
    setPatients((prev) =>
      (wasEditing ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved]).sort(
        (a, b) => a.name.localeCompare(b.name)
      )
    );
    setFormOpen(false);
  }

  function handleDeleted(id: number) {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    const qDigits = onlyDigits(q);

    return patients.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true;
      if (qDigits && onlyDigits(p.cpf).includes(qDigits)) return true;
      if (formatDateBR(p.birthDate).includes(q)) return true;
      return false;
    });
  }, [patients, query]);

  return (
    <Box>
      <HeaderRow>
        <Box>
          <Typography variant="h5" gutterBottom>
            Pacientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastro de pacientes da clínica.
          </Typography>
        </Box>
        <Button startIcon={<AddIcon />} onClick={openCreate} variant="contained">
          Novo Paciente
        </Button>
      </HeaderRow>

      <SearchField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nome, CPF ou data de nascimento"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIconMuted fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Nascimento</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>LGPD</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyStateText variant="body2" color="text.secondary">
                    {patients.length === 0
                      ? "Nenhum paciente cadastrado ainda."
                      : "Nenhum paciente encontrado para essa busca."}
                  </EmptyStateText>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <PatientNameCell>
                      <AvatarCircle>{getInitials(p.name)}</AvatarCircle>
                      {p.name}
                    </PatientNameCell>
                  </TableCell>
                  <TableCell>{p.cpf}</TableCell>
                  <TableCell>{formatDateBR(p.birthDate)}</TableCell>
                  <TableCell>{p.phone ?? "—"}</TableCell>
                  <TableCell>
                    {p.consent ? (
                      <Chip
                        icon={<CheckIcon />}
                        label="Consentiu"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="Pendente" size="small" color="error" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(p)} aria-label="Editar paciente">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(p)}
                      aria-label="Excluir paciente"
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PatientFormDialog
        key={formOpen ? (editingPatient?.id ?? "new") : "closed"}
        open={formOpen}
        editing={editingPatient}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <DeletePatientDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </Box>
  );
}
