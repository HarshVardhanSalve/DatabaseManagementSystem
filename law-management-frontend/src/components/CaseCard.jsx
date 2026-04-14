import { Card, Typography, Chip } from "@mui/material";

const CaseCard = ({ item }) => {
  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">{item.case_title}</Typography>

      <Typography>{item.description}</Typography>

      <Chip label={item.status_name || "Open"} color="primary" />
    </Card>
  );
};

export default CaseCard;