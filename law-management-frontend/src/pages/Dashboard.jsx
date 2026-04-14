import React from "react";
import Sidebar from "../components/Sidebar";
import { Box, Typography } from "@mui/material";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Box display="flex">
      <Sidebar />

      <Box sx={{ p: 3 }}>
        <Typography variant="h4">
          Welcome {user?.name}
        </Typography>

        <Typography>
          Role ID: {user?.role_id}
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;