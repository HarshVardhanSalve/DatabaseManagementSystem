const express = require("express");
const router = express.Router();
const { sendRequest, getMyRequests, getSentRequests, respondToRequest, getAssignedCases } = require("../controllers/lawyerController");
const { auth, authorize } = require("../middleware/auth");

router.post("/request", auth, authorize(3), sendRequest);            // Client sends request
router.get("/requests", auth, authorize(2), getMyRequests);          // Lawyer sees requests
router.get("/requests/sent", auth, authorize(3), getSentRequests);   // Client sees sent
router.put("/request/:id", auth, authorize(2), respondToRequest);    // Lawyer responds
router.get("/cases", auth, authorize(2), getAssignedCases);          // Lawyer's assigned cases

module.exports = router;