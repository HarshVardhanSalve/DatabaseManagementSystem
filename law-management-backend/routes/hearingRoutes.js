const express = require("express");
const router = express.Router();
const { createHearing, getHearings, getHearingById, updateHearing, deleteHearing, getJudges } = require("../controllers/hearingController");
const { auth, authorize } = require("../middleware/auth");

router.get("/judges", auth, getJudges);
router.post("/", auth, authorize(1, 2), createHearing);   // Admin or Lawyer
router.get("/", auth, getHearings);                        // Role-aware
router.get("/:id", auth, getHearingById);
router.put("/:id", auth, authorize(4, 1), updateHearing); // Judge or Admin
router.delete("/:id", auth, authorize(1), deleteHearing); // Admin

module.exports = router;