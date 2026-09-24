"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
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
import type { Patient } from "@prisma/client";
import { getInitials } from "@/lib/initials";
import { formatDateBR } from "@/lib/formatDate";
import { onlyDigits } from "@/lib/cpf";
import {
  AvatarCircle,
  EmptyStateText,
  HeaderRow,
  PatientNameCell,
  SearchField,
  SearchIconMuted,
} from "./RecordsSearch.styles";

/** Busca de paciente pro Prontuário — só DOCTOR chega aqui. Separada da busca
 *  de Pacientes (que ADMIN/ATTENDANT também usam): aqui abrir uma linha leva
 *  pro histórico clínico, não pro cadastro. */
export default function RecordsSearch({ initialPatients }: { initialPatients: Patient[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialPatients;
    const qDigits = onlyDigits(q);

    return initialPatients.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true;
      if (qDigits && onlyDigits(p.cpf).includes(qDigits)) return true;
      if (formatDateBR(p.birthDate).includes(q)) return true;
      return false;
    });
  }, [initialPatients, query]);

  return (
    <>
      <HeaderRow>
        <Typography variant="h5" gutterBottom>
          Prontuário
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Busque um paciente para ver o histórico clínico.
        </Typography>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyStateText variant="body2" color="text.secondary">
                    {initialPatients.length === 0
                      ? "Nenhum paciente cadastrado ainda."
                      : "Nenhum paciente encontrado para essa busca."}
                  </EmptyStateText>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  onClick={() => router.push(`/dashboard/records/${p.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <PatientNameCell>
                      <AvatarCircle>{getInitials(p.name)}</AvatarCircle>
                      {p.name}
                    </PatientNameCell>
                  </TableCell>
                  <TableCell>{p.cpf}</TableCell>
                  <TableCell>{formatDateBR(p.birthDate)}</TableCell>
                  <TableCell>{p.phone ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
