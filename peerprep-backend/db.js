const mysql = require("mysql2");

// create connection
const db = mysql.createConnection({
  host: "localhost",      // MySQL host
  user: "root",           // MySQL username
  password: "Dinesh123", // MySQL password
  database: "peerprep_db" // my database name
});

// connect
db.connect((err) => {
  if (err) {
    console.error("DB connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL");
});

module.exports = db;