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
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckIcon from "@mui/icons-material/Check";
import type { Patient } from "@prisma/client";
import { getInitials } from "@/lib/initials";
import { formatDateBR } from "@/lib/formatDate";
import { onlyDigits } from "@/lib/cpf";
import PatientFormDialog from "@/components/PatientFormDialog";

export default function PatientsManager({ initialPatients }: { initialPatients: Patient[] }) {
  const [patients, setPatients] = useState(initialPatients);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

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
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
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
      </Box>

      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nome, CPF ou data de nascimento"
        sx={{ maxWidth: 380, mb: 2.5 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
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
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {patients.length === 0
                      ? "Nenhum paciente cadastrado ainda."
                      : "Nenhum paciente encontrado para essa busca."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "action.selected",
                          color: "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(p.name)}
                      </Box>
                      {p.name}
                    </Box>
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
    </Box>
  );
}
