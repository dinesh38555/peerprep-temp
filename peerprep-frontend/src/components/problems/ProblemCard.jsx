import React, { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProblemCard({ problem, status, setStatus }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // 🩹 Prevent undefined errors
  if (!problem) return null;

  const handleToggleSolved = async () => {
    try {
      const newStatus = status === "Solved" ? "Unsolved" : "Solved";

      await api.post(
        "/progress/update",
        { problem_id: problem.problem_id, problem_status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus(problem.problem_id, newStatus);
    } catch (err) {
      console.error("Error updating progress:", err);
      setMessage("Please login to store your progress.");
      setTimeout(() => navigate("/auth"), 500);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "12px",
        margin: "12px 0",
        borderRadius: "8px",
      }}
    >
      <h3>{problem.title}</h3>

      {problem.url && (
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            marginBottom: "10px",
            color: "#2563eb",
          }}
        >
          View Problem
        </a>
      )}

      <button
        onClick={handleToggleSolved}
        style={{
          backgroundColor: status === "Solved" ? "#16a34a" : "#374151",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        {status === "Solved" ? "Unmark as Solved" : "Mark as Solved"}
      </button>

      {message && <p style={{ color: "red", marginTop: "8px" }}>{message}</p>}
    </div>
  );
}
