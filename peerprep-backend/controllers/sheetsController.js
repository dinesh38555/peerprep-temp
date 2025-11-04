const db = require("../db");

exports.getAllSheets = (req, res) => {
  db.query("SELECT * FROM sheets", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({message : "Error fetching sheets"});
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "No sheets found" });
    }
    res.json(results);
  });
};
