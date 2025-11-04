import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";

export default function SheetsPage() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    axios.get("/sheets")
      .then(res => setSheets(res.data))
      .catch(err => setError("Failed to load sheets."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading sheets...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Sheets</h2>
      {sheets.length === 0 && <p>No sheets available</p>}
      {sheets.map(sheet => (
        <div key={sheet.sheet_id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
          <Link to={`/problems/sheet/${sheet.sheet_id}`} state={{ sheetName: sheet.name }}>
            <h3>{sheet.name}</h3>
          </Link>
          <p>{sheet.description}</p>
        </div>
      ))}
    </div>
  );
}
