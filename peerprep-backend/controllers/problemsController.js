const db = require("../db");

// Get all problems in a sheet (with optional difficulty filter + pagination)
exports.getProblemsBySheet = (req, res) => {
  const sheet_id = parseInt(req.params.sheet_id, 10);
  const difficulty = req.query.difficulty;
  const limit = parseInt(req.query.limit, 10) || 10; // default 10
  const page = parseInt(req.query.page, 10) || 1; // default 1
  const offset = (page - 1) * limit;

  // Validate input
  if (isNaN(sheet_id)) return res.status(400).json({ message: "Invalid sheet_id" });

  let query = `
    SELECT 
      p.problem_id,
      COALESCE(ps.sheet_title, p.title) AS title,
      p.URL,
      p.platform,
      p.difficulty,
      p.category,
      ps.sheet_order
    FROM problems p
    JOIN problem_sheets ps ON p.problem_id = ps.problem_id
    WHERE ps.sheet_id = ?
  `;
  const params = [sheet_id];

  if (difficulty) {
    query += " AND p.difficulty = ?";
    params.push(difficulty);
  }

  // Add ordering and pagination
  query += " ORDER BY ps.sheet_order LIMIT ? OFFSET ?";
  params.push(limit, offset);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Error fetching problems" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No problems found" });
    }

    res.json({
      currentPage: page,
      pageSize: limit,
      problems: results
    });
  });
};

// Get a single problem by ID
exports.getProblemByID = (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Validatng input problem ID
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid problem ID" });
  }

  // As query doesn't change later, we use "const" instead of "let"
  const query = `SELECT * FROM problems WHERE problem_id = ?`;
  const params = [id];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Error fetching problem" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(results[0]);
  });
};
