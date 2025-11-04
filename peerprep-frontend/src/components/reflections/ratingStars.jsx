"use client";
import { useState } from "react";
import styles from "./ReflectionModal.module.css";

const RatingStars = ({ rating, onRatingChange, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readOnly) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  return (
    <div className={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${
            star <= (hoverRating || rating) ? styles.filled : ""
          } ${readOnly ? styles.readOnly : ""}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readOnly}
          aria-label={`Rate ${star} stars`}
        >
          ★
        </button>
      ))}
      {rating > 0 && (
        <span className={styles.ratingText}>
          {rating} / 5
        </span>
      )}
    </div>
  );
};

export default RatingStars;
