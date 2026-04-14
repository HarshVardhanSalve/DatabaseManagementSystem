import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Paper,
  MenuItem,
} from "@mui/material";
import { registerUser } from "../services/api";
import { toast } from "react-toastify";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_id: 3,
  });

  const roles = [
    { label: "Admin", value: 1 },
    { label: "Lawyer", value: 2 },
    { label: "Client", value: 3 },
    { label: "Judge", value: 4 },
  ];

  const handleRegister = async () => {
    try {
      await registerUser({
        ...data,
        role_id: Number(data.role_id),
      });

      toast.success("Registered Successfully");
    } catch {
      toast.error("Registration Failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 10 }}>

        <TextField
          fullWidth
          label="Name"
          sx={{ mt: 2 }}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />

        <TextField
          fullWidth
          label="Email"
          sx={{ mt: 2 }}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          sx={{ mt: 2 }}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        <TextField
          fullWidth
          label="Phone"
          sx={{ mt: 2 }}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
        />

        {/* 🔥 ROLE DROPDOWN ADDED HERE */}
        <TextField
          select
          fullWidth
          label="Role"
          sx={{ mt: 2 }}
          value={data.role_id}
          onChange={(e) => setData({ ...data, role_id: e.target.value })}
        >
          {roles.map((role) => (
            <MenuItem key={role.value} value={role.value}>
              {role.label}
            </MenuItem>
          ))}
        </TextField>

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          onClick={handleRegister}
        >
          Register
        </Button>

      </Paper>
    </Container>
  );
};

export default Register;