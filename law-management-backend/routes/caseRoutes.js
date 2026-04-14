const express = require("express");
const router = express.Router();
const { createCase, getCases, getCaseById, updateCase, deleteCase, getCaseStats } = require("../controllers/caseController");
const { auth, authorize } = require("../middleware/auth");

router.get("/stats/summary", auth, authorize(1), getCaseStats);
router.post("/", auth, authorize(3), createCase);         // Client creates case
router.get("/", auth, getCases);                          // Role-aware
router.get("/:id", auth, getCaseById);
router.put("/:id", auth, authorize(1), updateCase);       // Admin
router.delete("/:id", auth, authorize(1), deleteCase);    // Admin

module.exports = router;