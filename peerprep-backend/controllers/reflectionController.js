const db = require("../db");
// --------------------
// Add a reflection
// --------------------
exports.addReflection = (req, res) => {
  const user_id = req.user.user_id; // from JWT
  const { problem_id, reflection_text } = req.body;

  if (!reflection_text) {
    return res.status(400).json({ error: "Reflection text is required." });
  }

  const problemIdValue = problem_id !== undefined && problem_id !== null ? problem_id : null;

  const sql = `
    INSERT INTO reflections (user_id, problem_id, reflection_text)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      reflection_text = VALUES(reflection_text),
      updated_at = CURRENT_TIMESTAMP
  `;

  db.query(sql, [user_id, problemIdValue, reflection_text], (err) => {
    if (err) {
      console.error("Error adding reflection:", err);
      return res.status(500).json({ error: "Database error while adding reflection." });
    }

    res.status(201).json({
      message: "Reflection added successfully.",
    });
  });
};


// --------------------
// Get all reflections for logged-in user
// --------------------
exports.getUserReflections = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT * FROM reflections
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching reflections:", err);
      return res.status(500).json({ error: "Database error while fetching reflections." });
    }
    res.json(results);
  });
};

// --------------------
// Get reflection for a specific problem
// --------------------
exports.getProblemReflection = (req, res) => {
  const user_id = req.user.user_id;
  const { problem_id } = req.params;

  const sql = `
    SELECT * FROM reflections
    WHERE user_id = ? AND problem_id = ?
  `;

  db.query(sql, [user_id, problem_id], (err, results) => {
    if (err) {
      console.error("Error fetching reflection:", err);
      return res.status(500).json({ error: "Database error while fetching reflection." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Reflection not found for this problem." });
    }

    res.json(results[0]);
  });
};

// --------------------
// Update reflection for a specific problem
// --------------------
exports.updateReflection = (req, res) => {
  const user_id = req.user.user_id;
  const { problem_id } = req.params;
  const { reflection_text, sentiment, keywords, confidence_score } = req.body;

  if (!reflection_text) {
    return res.status(400).json({ error: "Reflection text is required." });
  }

  const sql = `
    UPDATE reflections
    SET reflection_text = ?, 
        sentiment = ?, 
        keywords = ?, 
        confidence_score = ?, 
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND problem_id = ?
  `;

  db.query(
    sql,
    [
      reflection_text,
      sentiment || null,
      keywords || null,
      confidence_score || null,
      user_id,
      problem_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating reflection:", err);
        return res
          .status(500)
          .json({ error: "Database error while updating reflection." });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Reflection not found for this problem." });
      }

      res.json({ message: "Reflection updated successfully." });
    }
  );
};


// --------------------
// Delete reflection for a specific problem
// --------------------
exports.deleteReflection = (req, res) => {
  const user_id = req.user.user_id;
  const { problem_id } = req.params;

  const sql = "DELETE FROM reflections WHERE user_id = ? AND problem_id = ?";
  db.query(sql, [user_id, problem_id], (err, result) => {
    if (err) {
      console.error("Error deleting reflection:", err);
      return res.status(500).json({ error: "Database error while deleting reflection." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reflection not found for this problem." });
    }

    res.json({ message: "Reflection deleted successfully." });
  });
};
