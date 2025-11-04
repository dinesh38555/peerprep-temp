import React from "react";
import axios from "../../api/axios";

export default function ProblemStatus({ problem_id, status, setStatus }) {
  const updateStatus = (newStatus) => {
    setStatus(problem_id, newStatus);

    axios.post("/progress/update", {
      problem_id,
      problem_status: newStatus
    }).catch(err => console.error("Failed to update status", err));
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <button onClick={() => updateStatus("Solved")} disabled={status === "Solved"}>Solved</button>
      <span style={{ marginLeft: "20px" }}>Status: {status || "Unsolved"}</span>
    </div>
  );
}
