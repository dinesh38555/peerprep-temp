"use client";
import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

const DailyNudge = ({ userId }) => {
  const [nudge, setNudge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyNudge();
  }, [userId]);

  const fetchDailyNudge = async () => {
    try {
      const response = await fetch(`/api/daily-nudge?user_id=${userId}`);
      const data = await response.json();
      setNudge(data.nudge);
    } catch (error) {
      console.error("Error fetching daily nudge:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.nudgeCard}>
        <div className={styles.nudgeHeader}>
          <span className={styles.icon}>✨</span>
          <h3>Daily Nudge</h3>
        </div>
        <p className={styles.nudgeLoading}>Loading your personalized tip...</p>
      </div>
    );
  }

  return (
    <div className={styles.nudgeCard}>
      <div className={styles.nudgeHeader}>
        <span className={styles.icon}>✨</span>
        <h3>Daily Nudge</h3>
      </div>
      <h4 className={styles.nudgeTitle}>{nudge?.title || "Keep it up!"}</h4>
      <p className={styles.nudgeMessage}>
        {nudge?.message || "Start solving problems to get personalized tips!"}
      </p>
    </div>
  );
};

export default DailyNudge;
