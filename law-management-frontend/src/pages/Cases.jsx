import React, { useEffect, useState } from "react";
import { getCases } from "../services/api";
import CaseCard from "../components/CaseCard";
import Sidebar from "../components/Sidebar";
import { Box } from "@mui/material";

const Cases = () => {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getCases();
      setCases(res.data);
    };

    fetchData();
  }, []);

  return (
    <Box display="flex">
      <Sidebar />

      <Box sx={{ p: 3, width: "100%" }}>
        {cases.map((c) => (
          <CaseCard key={c.case_id} item={c} />
        ))}
      </Box>
    </Box>
  );
};

export default Cases;