import React from "react";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Law Management System
        </Typography>

        <Button color="inherit" component={Link} to="/">
          Dashboard
        </Button>

        <Button color="inherit" component={Link} to="/cases">
          Cases
        </Button>

        <Button color="inherit" component={Link} to="/create-case">
          Create Case
        </Button>

        <Button color="inherit" component={Link} to="/login">
          Login
        </Button>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;