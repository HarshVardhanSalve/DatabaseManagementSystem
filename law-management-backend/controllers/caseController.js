const pool = require("../config/db");

// POST /api/cases  (Client)
const createCase = async (req, res) => {
  const { case_title, description, case_type, court_id } = req.body;
  if (!case_title || !court_id)
    return res.status(400).json({ message: "case_title and court_id are required" });

  try {
    const result = await pool.query(
      `INSERT INTO cases (case_title, description, case_type, client_id, court_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [case_title, description, case_type, req.user.user_id, court_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/cases  (Admin sees all; client/lawyer sees own)
const getCases = async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role_id === 1) {
      // Admin
      query = `SELECT * FROM case_summary`;
    } else if (req.user.role_id === 3) {
      // Client
      query = `SELECT * FROM case_summary WHERE case_id IN
               (SELECT case_id FROM cases WHERE client_id = $1)`;
      params = [req.user.user_id];
    } else if (req.user.role_id === 2) {
      // Lawyer
      query = `SELECT * FROM case_summary WHERE case_id IN
               (SELECT case_id FROM case_lawyer WHERE lawyer_id = $1)`;
      params = [req.user.user_id];
    } else if (req.user.role_id === 4) {
      // Judge
      query = `SELECT * FROM case_summary WHERE case_id IN
               (SELECT case_id FROM hearings WHERE judge_id = $1)`;
      params = [req.user.user_id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/cases/:id
const getCaseById = async (req, res) => {
  try {
    const caseRes = await pool.query(
      `SELECT c.*, u.name AS client_name, ct.court_name, cs.status_name
       FROM cases c
       JOIN users u ON c.client_id = u.user_id
       JOIN courts ct ON c.court_id = ct.court_id
       JOIN case_status cs ON c.status_id = cs.status_id
       WHERE c.case_id = $1`,
      [req.params.id]
    );
    if (!caseRes.rows.length) return res.status(404).json({ message: "Case not found" });

    const lawyers = await pool.query(
      `SELECT u.user_id, u.name, cl.role FROM case_lawyer cl
       JOIN users u ON cl.lawyer_id = u.user_id WHERE cl.case_id = $1`,
      [req.params.id]
    );
    const hearings = await pool.query(
      `SELECT h.*, u.name AS judge_name FROM hearings h
       LEFT JOIN users u ON h.judge_id = u.user_id WHERE h.case_id = $1`,
      [req.params.id]
    );

    res.json({ ...caseRes.rows[0], lawyers: lawyers.rows, hearings: hearings.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cases/:id  (Admin)
const updateCase = async (req, res) => {
  const { case_title, description, case_type, status_id, court_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cases SET case_title=$1, description=$2, case_type=$3, status_id=$4, court_id=$5
       WHERE case_id=$6 RETURNING *`,
      [case_title, description, case_type, status_id, court_id, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Case not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cases/:id  (Admin)
const deleteCase = async (req, res) => {
  try {
    await pool.query("DELETE FROM cases WHERE case_id = $1", [req.params.id]);
    res.json({ message: "Case deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/cases/stats/summary  (Admin)
const getCaseStats = async (req, res) => {
  try {
    const total = await pool.query("SELECT get_total_cases() AS total");
    const byStatus = await pool.query(
      `SELECT cs.status_name, COUNT(*) AS count FROM cases c
       JOIN case_status cs ON c.status_id = cs.status_id GROUP BY cs.status_name`
    );
    const byType = await pool.query(
      `SELECT case_type, COUNT(*) AS count FROM cases WHERE case_type IS NOT NULL GROUP BY case_type`
    );
    res.json({ total: total.rows[0].total, byStatus: byStatus.rows, byType: byType.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createCase, getCases, getCaseById, updateCase, deleteCase, getCaseStats };