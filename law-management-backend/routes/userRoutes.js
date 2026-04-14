const express = require("express");
const router = express.Router();
const { register, login, getAllUsers, getLawyers, getProfile, updateProfile } = require("../controllers/userController");
const { auth, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/", auth, authorize(1), getAllUsers);         // Admin only
router.get("/lawyers", getLawyers);                       // Public
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;