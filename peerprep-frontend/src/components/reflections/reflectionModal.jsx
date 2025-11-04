"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import RatingStars from "./RatingStars";
import styles from "./ReflectionModal.module.css";

const ReflectionModal = ({ show, onClose, problemData, onSubmit }) => {
  const [reflection, setReflection] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  const handleSubmit = async () => {
    if (!reflection.trim() || rating === 0) {
      alert("Please provide both reflection and rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reflections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem_id: problemData.problemId,
          progress_id: problemData.progressId,
          content: reflection,
          rating: rating,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit reflection");
      }

      const data = await response.json();
      
      setReflection("");
      setRating(0);
      
      if (onSubmit) {
        onSubmit(data.reflection);
      }
      
      onClose();
    } catch (error) {
      console.error("Error submitting reflection:", error);
      alert("Failed to submit reflection. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReflection("");
      setRating(0);
      onClose();
    }
  };

  if (!mounted || !show) return null;

  return createPortal(
    <div className={`${styles.modalOverlay} ${show ? styles.show : ""}`} onClick={handleClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>Reflect on Your Solution 🎯</h2>
          <button className={styles.closeButton} onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </header>

        <main className={styles.modalContent}>
          <div className={styles.problemInfo}>
            <h3>{problemData.title}</h3>
            <span className={`${styles.badge} ${styles[problemData.difficulty?.toLowerCase()]}`}>
              {problemData.difficulty}
            </span>
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>
              How would you rate this problem?
            </label>
            <RatingStars rating={rating} onRatingChange={setRating} />
          </div>

          <div className={styles.formSection}>
            <label className={styles.label} htmlFor="reflection">
              Share your thoughts and learnings
            </label>
            <textarea
              id="reflection"
              className={styles.textarea}
              placeholder="What did you learn? What was challenging? What approach did you use? How confident do you feel about this solution?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={6}
              disabled={isSubmitting}
            />
            <div className={styles.charCount}>
              {reflection.length} characters
            </div>
          </div>

          <div className={styles.tips}>
            <p className={styles.tipTitle}>💡 Reflection Tips:</p>
            <ul>
              <li>Describe your approach and reasoning</li>
              <li>Note any challenges you faced</li>
              <li>Mention concepts or patterns you applied</li>
              <li>Express your confidence level</li>
            </ul>
          </div>
        </main>

        <footer className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Skip for Now
          </button>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isSubmitting || !reflection.trim() || rating === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Reflection"}
          </button>
        </footer>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ReflectionModal;
