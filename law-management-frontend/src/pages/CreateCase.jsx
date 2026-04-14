import React, { useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import { createCase } from "../services/api";

const CreateCase = () => {
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    try {
      await createCase({ case_title: title, client_id: 1 });
      alert("Case Created");
    } catch (err) {
      alert("Error creating case");
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h5">Create Case</Typography>

      <TextField
        fullWidth
        label="Case Title"
        sx={{ mt: 2 }}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Button variant="contained" sx={{ mt: 3 }} onClick={handleCreate}>
        Create
      </Button>
    </Container>
  );
};

export default CreateCase;