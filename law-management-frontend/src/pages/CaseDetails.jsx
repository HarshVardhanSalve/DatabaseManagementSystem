import React from "react";
import { Container, Typography } from "@mui/material";

const CaseDetails = () => {
  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h5">Case Details</Typography>

      <Typography sx={{ mt: 2 }}>
        Select a case to view details
      </Typography>
    </Container>
  );
};

export default CaseDetails;