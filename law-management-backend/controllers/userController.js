const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST /api/users/register
const register = async (req, res) => {
  const { name, email, password, phone, role_id } = req.body;
  if (!name || !email || !password || !role_id)
    return res.status(400).json({ message: "Required fields missing" });

  try {
    const exists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (exists.rows.length > 0)
      return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, phone, role_id) VALUES ($1,$2,$3,$4,$5) RETURNING user_id, name, email, role_id",
      [name, email, hashed, phone, role_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id, name: user.name },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    );
    res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, role_id: user.role_id } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users  (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.phone, u.created_at, r.role_name
       FROM users u JOIN roles r ON u.role_id = r.role_id ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/lawyers
const getLawyers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.phone, ud.specialization, ud.experience_years, c.court_name
       FROM users u
       LEFT JOIN user_details ud ON u.user_id = ud.user_id
       LEFT JOIN courts c ON ud.court_id = c.court_id
       WHERE u.role_id = 2`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.phone, r.role_name,
              ud.address, ud.specialization, ud.experience_years, c.court_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN user_details ud ON u.user_id = ud.user_id
       LEFT JOIN courts c ON ud.court_id = c.court_id
       WHERE u.user_id = $1`,
      [req.user.user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { name, phone, address, specialization, experience_years, court_id } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE users SET name=$1, phone=$2 WHERE user_id=$3", [name, phone, req.user.user_id]);
    await client.query(
      `UPDATE user_details SET address=$1, specialization=$2, experience_years=$3, court_id=$4 WHERE user_id=$5`,
      [address, specialization, experience_years, court_id, req.user.user_id]
    );
    await client.query("COMMIT");
    res.json({ message: "Profile updated" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

module.exports = { register, login, getAllUsers, getLawyers, getProfile, updateProfile };