const db = require("../db");

// ---------------------------
// Update or Insert Progress
// ---------------------------
exports.updateProgress = (req, res) => {
  const { problem_id, problem_status } = req.body;
  const user_id = req.user.user_id;

  if (!problem_id || !problem_status) {
    return res.status(400).json({ error: "problem_id and problem_status are required" });
  }

  // Check if there's already a record for this user + problem
  const checkSql = `SELECT problem_status FROM user_progress WHERE user_id = ? AND problem_id = ?`;

  db.query(checkSql, [user_id, problem_id], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: err.message });
    }

    const currentStatus = results.length ? results[0].problem_status : "Unsolved";
    let newStatus;

    // Toggle logic
    if (problem_status === "Solved" && currentStatus === "Solved") {
      newStatus = "Unsolved"; // unmark
    } else {
      newStatus = problem_status; // mark as new status
    }

    // Update or insert
    const sql = `
      INSERT INTO user_progress (user_id, problem_id, problem_status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE problem_status = ?, time_updated = CURRENT_TIMESTAMP
    `;

    db.query(sql, [user_id, problem_id, newStatus, newStatus], (err) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: `Progress set to ${newStatus}`, newStatus });
    });
  });
};


// ---------------------------
// Get User Progress
// ---------------------------
// controllers/userProgressController.js
exports.getProblemsWithProgress = (req, res) => {
  const user_id = req.user.user_id;
  const { sheet_id } = req.params;

  const sql = `
    SELECT 
      p.problem_id,
      p.title,
      p.url,
      COALESCE(up.problem_status, 'Unsolved') AS problem_status
    FROM problems p
    JOIN problem_sheets ps ON p.problem_id = ps.problem_id
    LEFT JOIN user_progress up 
      ON up.problem_id = p.problem_id AND up.user_id = ?
    WHERE ps.sheet_id = ?
    ORDER BY ps.sheet_order ASC;
  `;

  db.query(sql, [user_id, sheet_id], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

