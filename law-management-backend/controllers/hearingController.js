const pool = require("../config/db");

// POST /api/hearings  (Admin or Lawyer requests a hearing)
const createHearing = async (req, res) => {
  const { case_id, judge_id, hearing_date, notes } = req.body;
  if (!case_id || !judge_id || !hearing_date)
    return res.status(400).json({ message: "case_id, judge_id, and hearing_date are required" });

  try {
    const result = await pool.query(
      `INSERT INTO hearings (case_id, judge_id, hearing_date, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [case_id, judge_id, hearing_date, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hearings  (Role-aware)
const getHearings = async (req, res) => {
  try {
    let query;
    let params = [];

    const base = `SELECT h.*, c.case_title, u.name AS judge_name,
                  cl.name AS client_name
                  FROM hearings h
                  JOIN cases c ON h.case_id = c.case_id
                  JOIN users u ON h.judge_id = u.user_id
                  JOIN users cl ON c.client_id = cl.user_id`;

    if (req.user.role_id === 1) {
      // Admin sees all
      query = `${base} ORDER BY h.hearing_date DESC`;
    } else if (req.user.role_id === 4) {
      // Judge sees own hearings
      query = `${base} WHERE h.judge_id = $1 ORDER BY h.hearing_date DESC`;
      params = [req.user.user_id];
    } else if (req.user.role_id === 3) {
      // Client sees hearings for their cases
      query = `${base} WHERE c.client_id = $1 ORDER BY h.hearing_date DESC`;
      params = [req.user.user_id];
    } else if (req.user.role_id === 2) {
      // Lawyer sees hearings for assigned cases
      query = `${base} WHERE h.case_id IN
               (SELECT case_id FROM case_lawyer WHERE lawyer_id = $1)
               ORDER BY h.hearing_date DESC`;
      params = [req.user.user_id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hearings/:id
const getHearingById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.*, c.case_title, u.name AS judge_name
       FROM hearings h
       JOIN cases c ON h.case_id = c.case_id
       JOIN users u ON h.judge_id = u.user_id
       WHERE h.hearing_id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Hearing not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/hearings/:id  (Judge updates outcome)
const updateHearing = async (req, res) => {
  const { status, decision, sentence, notes, hearing_date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE hearings SET status=$1, decision=$2, sentence=$3, notes=$4, hearing_date=$5
       WHERE hearing_id=$6 RETURNING *`,
      [status, decision, sentence, notes, hearing_date, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Hearing not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/hearings/:id  (Admin)
const deleteHearing = async (req, res) => {
  try {
    await pool.query("DELETE FROM hearings WHERE hearing_id = $1", [req.params.id]);
    res.json({ message: "Hearing deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hearings/judges  (Get all judges for dropdown)
const getJudges = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_id, name, email FROM users WHERE role_id = 4"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createHearing, getHearings, getHearingById, updateHearing, deleteHearing, getJudges };