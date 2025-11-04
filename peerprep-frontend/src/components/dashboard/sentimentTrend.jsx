"use client";
import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

const SentimentTrend = ({ userId }) => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentimentTrend();
  }, [userId]);

  const fetchSentimentTrend = async () => {
    try {
      const response = await fetch(`/api/sentiment-trends?user_id=${userId}&days=7`);
      const data = await response.json();
      setTrendData(data.trends || []);
    } catch (error) {
      console.error("Error fetching sentiment trends:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxValue = Math.max(...trendData.map(d => Math.abs(d.avg_sentiment)), 1);
  const chartHeight = 120;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getYPosition = (value) => {
    const normalized = (value + 1) / 2; // Convert -1 to 1 range to 0 to 1
    return chartHeight - (normalized * chartHeight);
  };

  return (
    <div className={styles.sentimentCard}>
      <div className={styles.cardHeader}>
        <span className={styles.icon}>📈</span>
        <h3>Sentiment Trend</h3>
      </div>
      <p className={styles.cardSubtitle}>
        Your reflection sentiment over the last 7 days
      </p>

      {loading ? (
        <div className={styles.chartLoading}>Loading chart...</div>
      ) : trendData.length === 0 ? (
        <div className={styles.chartEmpty}>
          No sentiment data yet. Start solving problems!
        </div>
      ) : (
        <div className={styles.chartContainer}>
          <svg className={styles.lineChart} viewBox={`0 0 ${trendData.length * 50} ${chartHeight + 30}`}>
            {/* Grid lines */}
            <line 
              x1="0" 
              y1={chartHeight / 2} 
              x2={trendData.length * 50} 
              y2={chartHeight / 2} 
              stroke="#e5e7eb" 
              strokeDasharray="4 4"
            />
            
            {/* Sentiment line */}
            <polyline
              points={trendData.map((d, i) => 
                `${i * 50 + 25},${getYPosition(d.avg_sentiment)}`
              ).join(' ')}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.trendLine}
            />

            {/* Data points */}
            {trendData.map((d, i) => (
              <g key={i}>
                <circle
                  cx={i * 50 + 25}
                  cy={getYPosition(d.avg_sentiment)}
                  r="5"
                  fill="#6366f1"
                  className={styles.dataPoint}
                />
                {/* Date labels */}
                <text
                  x={i * 50 + 25}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  className={styles.dateLabel}
                >
                  {formatDate(d.date)}
                </text>
              </g>
            ))}
          </svg>

          <div className={styles.sentimentScale}>
            <span className={styles.scaleLabel}>Positive (+1)</span>
            <span className={styles.scaleLabel}>Neutral (0)</span>
            <span className={styles.scaleLabel}>Negative (-1)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentTrend;
