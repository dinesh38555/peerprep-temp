import React from "react";
import DailyNudge from "./dailyNudge";
import ProgressPieChart from "./progressPieChart";
import SentimentTrend from "./sentimentTrend";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      <DailyNudge />
      <ProgressPieChart />
      <SentimentTrend />
    </div>
  );
}
