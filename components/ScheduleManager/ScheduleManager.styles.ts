import { Box, Button, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

export const DayCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export const ScheduleRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const AddScheduleButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));
