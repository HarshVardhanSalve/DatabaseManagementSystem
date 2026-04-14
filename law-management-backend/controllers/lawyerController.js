const pool = require("../config/db");

// POST /api/lawyers/request  (Client sends request to lawyer)
const sendRequest = async (req, res) => {
  const { case_id, lawyer_id } = req.body;
  if (!case_id || !lawyer_id)
    return res.status(400).json({ message: "case_id and lawyer_id are required" });

  try {
    // Verify case belongs to client
    const caseCheck = await pool.query(
      "SELECT * FROM cases WHERE case_id = $1 AND client_id = $2",
      [case_id, req.user.user_id]
    );
    if (!caseCheck.rows.length)
      return res.status(403).json({ message: "You don't own this case" });

    // Avoid duplicate pending request
    const dupCheck = await pool.query(
      "SELECT * FROM lawyer_requests WHERE case_id=$1 AND lawyer_id=$2 AND status='Pending'",
      [case_id, lawyer_id]
    );
    if (dupCheck.rows.length)
      return res.status(409).json({ message: "Request already pending" });

    const result = await pool.query(
      `INSERT INTO lawyer_requests (case_id, lawyer_id, client_id) VALUES ($1,$2,$3) RETURNING *`,
      [case_id, lawyer_id, req.user.user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lawyers/requests  (Lawyer sees incoming requests)
const getMyRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lr.*, c.case_title, u.name AS client_name
       FROM lawyer_requests lr
       JOIN cases c ON lr.case_id = c.case_id
       JOIN users u ON lr.client_id = u.user_id
       WHERE lr.lawyer_id = $1 ORDER BY lr.request_id DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lawyers/requests/sent  (Client sees sent requests)
const getSentRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lr.*, c.case_title, u.name AS lawyer_name
       FROM lawyer_requests lr
       JOIN cases c ON lr.case_id = c.case_id
       JOIN users u ON lr.lawyer_id = u.user_id
       WHERE lr.client_id = $1 ORDER BY lr.request_id DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/lawyers/request/:id  (Lawyer accepts/rejects)
const respondToRequest = async (req, res) => {
  const { status } = req.body; // 'Accepted' | 'Rejected'
  if (!["Accepted", "Rejected"].includes(status))
    return res.status(400).json({ message: "Status must be Accepted or Rejected" });

  try {
    const result = await pool.query(
      `UPDATE lawyer_requests SET status=$1 WHERE request_id=$2 AND lawyer_id=$3 RETURNING *`,
      [status, req.params.id, req.user.user_id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Request not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lawyers/cases  (Lawyer sees assigned cases)
const getAssignedCases = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name AS client_name, ct.court_name, cs.status_name, cl.role AS lawyer_role
       FROM case_lawyer cl
       JOIN cases c ON cl.case_id = c.case_id
       JOIN users u ON c.client_id = u.user_id
       JOIN courts ct ON c.court_id = ct.court_id
       JOIN case_status cs ON c.status_id = cs.status_id
       WHERE cl.lawyer_id = $1`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendRequest, getMyRequests, getSentRequests, respondToRequest, getAssignedCases };