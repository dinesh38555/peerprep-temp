const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = "your_secret_key"; // move to .env later

// ---------------------------
// Signup Controller
// ---------------------------
exports.signup = async (req, res) => {
  const { username, first_name, last_name, email, user_password, user_role } = req.body;

  try {
    if (!username || !first_name || !last_name || !email || !user_password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Insert user into database
    const sql = `
      INSERT INTO users (username, first_name, last_name, email, user_password, user_role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [username, first_name, last_name, email, hashedPassword, user_role || "Student"],
      (err) => {
        if (err) {
          console.error("DB Error:", err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Username or email already exists" });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Signup successful" });
      }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
};

// ---------------------------
// Login Controller
// ---------------------------
exports.login = (req, res) => {
  const { usernameOrEmail, user_password } = req.body;

  if (!usernameOrEmail || !user_password) {
    return res.status(400).json({ error: "Username/Email and password are required" });
  }

  const sql = `
    SELECT * FROM users 
    WHERE email = ? OR username = ?
  `;

  db.query(sql, [usernameOrEmail, usernameOrEmail], async (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = results[0];

    const valid = await bcrypt.compare(user_password, user.user_password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_role: user.user_role,
      },
    });
  });
};
