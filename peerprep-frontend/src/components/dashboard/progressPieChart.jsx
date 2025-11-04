"use client";
import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

const ProgressPieChart = ({ userId }) => {
  const [progress, setProgress] = useState({ solved: 0, attempted: 0, total: 37 });

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress?user_id=${userId}`);
      const data = await response.json();
      setProgress(data.progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const solvedPercentage = progress.total > 0 
    ? (progress.solved / progress.total) * 100 
    : 0;
  const attemptedPercentage = progress.total > 0 
    ? (progress.attempted / progress.total) * 100 
    : 0;

  // SVG circle calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const solvedOffset = circumference - (solvedPercentage / 100) * circumference;
  const attemptedOffset = circumference - (attemptedPercentage / 100) * circumference;

  return (
    <div className={styles.progressCard}>
      <div className={styles.cardHeader}>
        <span className={styles.icon}>🎯</span>
        <h3>Progress</h3>
      </div>
      
      <div className={styles.progressContent}>
        <svg className={styles.progressCircle} viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          
          {/* Attempted circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={attemptedOffset}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            className={styles.progressCircleAnimated}
          />
          
          {/* Solved circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={solvedOffset}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            className={styles.progressCircleAnimated}
          />
          
          {/* Center text */}
          <text
            x="80"
            y="75"
            textAnchor="middle"
            className={styles.progressNumber}
          >
            {progress.total}
          </text>
          <text
            x="80"
            y="95"
            textAnchor="middle"
            className={styles.progressLabel}
          >
            Total Problems
          </text>
        </svg>

        <div className={styles.progressLegend}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.solved}`}></span>
            <span className={styles.legendText}>
              Solved: {progress.solved}
            </span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.attempted}`}></span>
            <span className={styles.legendText}>
              Attempted: {progress.attempted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPieChart;
