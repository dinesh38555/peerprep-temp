import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProblemCard from "../components/problems/ProblemCard";

export default function ProblemsPage() {
  const { sheet_id } = useParams();
  const location = useLocation();
  const sheetName = location.state?.sheetName || `Sheet ${sheet_id}`;
  const { token } = useAuth();

  const [problems, setProblems] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch problems and progress
  useEffect(() => {
    const fetchProblemsWithProgress = async () => {
      try {
        setLoading(true);
        setError("");

        let res;
        if (token) {
          res = await axios.get(`/progress/sheet/${sheet_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          res = await axios.get(`/problems/sheet/${sheet_id}`);
        }

        const problemsArray = Array.isArray(res.data)
          ? res.data
          : res.data.problems || [];

        setProblems(problemsArray);

        // ✅ Build progress map directly from backend data
        const map = {};
        problemsArray.forEach((p) => {
          map[p.problem_id] = p.problem_status || "Unsolved";
        });
        setProgressMap(map);
      } catch (err) {
        console.error("Error loading problems:", err);
        setError("Failed to load problems or progress.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblemsWithProgress();
  }, [sheet_id, token]);

  // ✅ Update status locally
  const setStatus = (problem_id, status) => {
    setProgressMap((prev) => ({ ...prev, [problem_id]: status }));

    // Also update in problems array so that it persists in UI list
    setProblems((prev) =>
      prev.map((p) =>
        p.problem_id === problem_id ? { ...p, problem_status: status } : p
      )
    );
  };

  if (loading) return <p>Loading problems...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="problems-container">
      <h2>Problems for {sheetName}</h2>

      {problems.length === 0 ? (
        <p>No problems available.</p>
      ) : (
        problems.map((problem) => (
          <ProblemCard
            key={problem.problem_id}
            problem={problem}
            status={progressMap[problem.problem_id] || "Unsolved"}
            setStatus={setStatus}
          />
        ))
      )}
    </div>
  );
}