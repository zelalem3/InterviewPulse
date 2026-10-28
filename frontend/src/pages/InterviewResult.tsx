import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import LoadingSpinner from "../components/LoadinSpinner";

interface DetailedBreakdownItem {
  question_type?: string;
  index?: number;
  critique?: string;
}

interface ParsedFeedback {
  summary?: string;
  categories?: Record<string, number | string>;
  detailed_breakdown?: DetailedBreakdownItem[];
}

interface InterviewResultData {
  feedback_summary?: string;
  overall_score?: number | string;
  [key: string]: unknown;
}

export function InterviewResult() {
  const { id } = useParams();
  const [result, setResult] = useState<InterviewResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const response = await api.post(`/interviews/${id}/evaluate`);
        setResult(response.data);
      } catch (e) {
        console.error("Evaluation error:", e);
        setError("Failed to generate or load interview results.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchResult();
    }
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div style={{ padding: "40px", color: "#ff6b6b", textAlign: "center" }}>
        {error}
      </div>
    );
  if (!result)
    return (
      <div style={{ padding: "40px", color: "#fff", textAlign: "center" }}>
        No result found.
      </div>
    );

  let parsedFeedback: ParsedFeedback = {
    summary: result.feedback_summary,
    categories: {},
    detailed_breakdown: [],
  };
  try {
    if (result.feedback_summary) {
      parsedFeedback = JSON.parse(result.feedback_summary);
    }
  } catch {
    parsedFeedback.summary = result.feedback_summary;
  }

  const score = Number(result.overall_score) || 0;
  const scoreColor =
    score >= 8 ? "#4CAF50" : score >= 6 ? "#FFC107" : "#FF6B6B";

  return (
    <div
      style={{
        maxWidth: "860px",
        margin: "40px auto",
        padding: "0 20px 60px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: "#e4e4e7",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            margin: "0 0 8px 0",
            letterSpacing: "-0.5px",
          }}
        >
          Interview Evaluation Report
        </h1>
        <p style={{ margin: 0, color: "#a1a1aa", fontSize: "15px" }}>
          Detailed feedback and performance breakdown
        </p>
      </div>

      {/* Overall Score Card */}
      <div
        style={{
          background: "linear-gradient(145deg, #252526 0%, #1e1e1e 100%)",
          border: "1px solid #333",
          borderRadius: "16px",
          padding: "28px 32px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#a1a1aa",
              marginBottom: "6px",
            }}
          >
            Overall Score
          </div>
          <div style={{ fontSize: "15px", color: "#d4d4d8" }}>
            Based on technical knowledge, communication & problem-solving
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: scoreColor,
              lineHeight: 1,
            }}
          >
            {result.overall_score ?? "N/A"}
            <span style={{ fontSize: "20px", color: "#71717a", fontWeight: 500 }}>
              {" "}
              / 10
            </span>
          </div>
        </div>
      </div>

      {/* Category Ratings */}
      {parsedFeedback.categories &&
        Object.keys(parsedFeedback.categories).length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                margin: "0 0 16px 0",
                color: "#f4f4f5",
              }}
            >
              Category Ratings
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "14px",
              }}
            >
              {Object.entries(parsedFeedback.categories).map(
                ([category, score]) => (
                  <div
                    key={category}
                    style={{
                      background: "#252526",
                      border: "1px solid #333",
                      borderRadius: "12px",
                      padding: "18px 20px",
                      transition: "transform 0.15s ease, border-color 0.15s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#a1a1aa",
                        textTransform: "capitalize",
                        marginBottom: "8px",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {category.replace(/_/g, " ")}
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {String(score)}
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#71717a",
                          fontWeight: 500,
                        }}
                      >
                        {" "}
                        / 10
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

      {/* Feedback Summary */}
      <div
        style={{
          background: "#252526",
          border: "1px solid #333",
          borderRadius: "16px",
          padding: "28px 32px",
          marginBottom: "28px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            margin: "0 0 16px 0",
            color: "#f4f4f5",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "4px",
              height: "18px",
              background: "#007acc",
              borderRadius: "2px",
              display: "inline-block",
            }}
          />
          Feedback Summary
        </h2>
        <p
          style={{
            margin: 0,
            lineHeight: 1.7,
            color: "#d4d4d8",
            fontSize: "15px",
            whiteSpace: "pre-wrap",
          }}
        >
          {parsedFeedback.summary}
        </p>
      </div>

      {/* Detailed Breakdown */}
      {parsedFeedback.detailed_breakdown &&
        parsedFeedback.detailed_breakdown.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                margin: "0 0 16px 0",
                color: "#f4f4f5",
              }}
            >
              Detailed Breakdown
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {parsedFeedback.detailed_breakdown.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#252526",
                    border: "1px solid #333",
                    borderRadius: "12px",
                    padding: "20px 24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        background: "#1e3a5f",
                        color: "#60a5fa",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "20px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {item.question_type || "Review"}
                    </span>
                    <span style={{ color: "#71717a", fontSize: "13px" }}>
                      #{item.index || idx + 1}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.65,
                      color: "#d4d4d8",
                      fontSize: "14.5px",
                    }}
                  >
                    {item.critique}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}