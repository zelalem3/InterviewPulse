import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import LoadingSpinner from "../components/LoadinSpinner";

interface DetailedBreakdownItem {
  question_type?: string;
  index?: number;
  question?: string;
  answer?: string;
  critique?: string;
  score?: number | string;
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

    if (id) fetchResult();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div style={{ padding: 40, color: "#ff6b6b", textAlign: "center", fontSize: 16 }}>
        {error}
      </div>
    );
  }
  if (!result) {
    return (
      <div style={{ padding: 40, color: "#fff", textAlign: "center" }}>
        No result found.
      </div>
    );
  }

  // Parse the feedback_summary JSON string
  let parsedFeedback: ParsedFeedback = {
    summary: "",
    categories: {},
    detailed_breakdown: [],
  };

  try {
    if (result.feedback_summary) {
      parsedFeedback = JSON.parse(result.feedback_summary);
    }
  } catch {
    parsedFeedback.summary = result.feedback_summary || "";
  }

  const score = Number(result.overall_score) || 0;
  const scoreColor =
    score >= 8 ? "#22c55e" : score >= 6.5 ? "#eab308" : score >= 5 ? "#f97316" : "#ef4444";

  // Simple bold renderer for **text**
  const renderText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color: "#f4f4f5", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "40px 24px 80px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: "#e4e4e7",
        background: "#0f0f11",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(34, 197, 94, 0.12)",
            color: "#4ade80",
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />
          Evaluation Complete
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            margin: "0 0 8px",
            letterSpacing: "-0.8px",
            color: "#fafafa",
          }}
        >
          Interview Evaluation Report
        </h1>
        <p style={{ margin: 0, color: "#a1a1aa", fontSize: 16 }}>
          Comprehensive feedback on technical skills, communication & problem-solving
        </p>
      </div>

      {/* Score + Categories */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 20,
          marginBottom: 36,
        }}
      >
        {/* Overall Score Card */}
        <div
          style={{
            background: "linear-gradient(160deg, #1a1a1e 0%, #141416 100%)",
            border: "1px solid #27272a",
            borderRadius: 20,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "#71717a",
              marginBottom: 12,
            }}
          >
            Overall Score
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: scoreColor,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            {result.overall_score ?? "—"}
          </div>
          <div style={{ fontSize: 18, color: "#52525b", marginTop: 4 }}>/ 10</div>

          <div
            style={{
              width: "100%",
              height: 6,
              background: "#27272a",
              borderRadius: 99,
              marginTop: 24,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(score * 10, 100)}%`,
                height: "100%",
                background: scoreColor,
                borderRadius: 99,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* Category Ratings */}
        <div
          style={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: 20,
            padding: "28px 28px 20px",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px",
              fontSize: 15,
              fontWeight: 600,
              color: "#a1a1aa",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Category Breakdown
          </h3>

          {parsedFeedback.categories &&
          Object.keys(parsedFeedback.categories).length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Object.entries(parsedFeedback.categories).map(
                ([category, catScore]) => {
                  const val = Number(catScore) || 0;
                  return (
                    <div key={category}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            color: "#d4d4d8",
                            textTransform: "capitalize",
                          }}
                        >
                          {category.replace(/_/g, " ")}
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#fafafa",
                          }}
                        >
                          {catScore}/10
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "#27272a",
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${val * 10}%`,
                            height: "100%",
                            background:
                              val >= 8
                                ? "#22c55e"
                                : val >= 6.5
                                ? "#eab308"
                                : val >= 5
                                ? "#f97316"
                                : "#ef4444",
                            borderRadius: 99,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <p style={{ color: "#71717a", margin: 0, fontSize: 14 }}>
              Category scores not available
            </p>
          )}
        </div>
      </div>

      {/* Feedback Summary */}
      <section
        style={{
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: 20,
          padding: "32px",
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            margin: "0 0 20px",
            fontSize: 20,
            fontWeight: 650,
            color: "#fafafa",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 4,
              height: 22,
              background: "#3b82f6",
              borderRadius: 2,
            }}
          />
          Feedback Summary
        </h2>
        <div
          style={{
            lineHeight: 1.75,
            color: "#d4d4d8",
            fontSize: 15.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {renderText(parsedFeedback.summary || "")}
        </div>
      </section>

      {/* Detailed Breakdown */}
      {parsedFeedback.detailed_breakdown &&
        parsedFeedback.detailed_breakdown.length > 0 && (
          <section>
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: 20,
                fontWeight: 650,
                color: "#fafafa",
              }}
            >
              Question-by-Question Breakdown
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {parsedFeedback.detailed_breakdown.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: 18,
                    overflow: "hidden",
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      background: "#1f1f23",
                      padding: "14px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #27272a",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          background:
                            item.question_type === "coding"
                              ? "#3b1f1f"
                              : "#1e3a5f",
                          color:
                            item.question_type === "coding"
                              ? "#f87171"
                              : "#60a5fa",
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "4px 12px",
                          borderRadius: 999,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {item.question_type || "Question"}
                      </span>
                      <span style={{ color: "#71717a", fontSize: 14 }}>
                        #{item.index || idx + 1}
                      </span>
                    </div>

                    {item.score !== undefined && (
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color:
                            Number(item.score) >= 8
                              ? "#22c55e"
                              : Number(item.score) >= 6
                              ? "#eab308"
                              : "#f97316",
                        }}
                      >
                        {item.score}/10
                      </span>
                    )}
                  </div>

                  <div style={{ padding: "24px" }}>
                    {/* Question */}
                    {item.question && (
                      <div style={{ marginBottom: 20 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#71717a",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            marginBottom: 8,
                          }}
                        >
                          Question
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 15.5,
                            lineHeight: 1.6,
                            color: "#f4f4f5",
                            fontWeight: 500,
                          }}
                        >
                          {item.question}
                        </p>
                      </div>
                    )}

                    {/* Answer */}
                    {item.answer && (
                      <div
                        style={{
                          marginBottom: 20,
                          background: "#0f0f11",
                          border: "1px solid #27272a",
                          borderRadius: 12,
                          padding: "16px 18px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#71717a",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            marginBottom: 8,
                          }}
                        >
                          Your Answer
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14.5,
                            lineHeight: 1.65,
                            color: "#d4d4d8",
                            whiteSpace: "pre-wrap",
                            fontFamily:
                              item.question_type === "coding"
                                ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                                : "inherit",
                          }}
                        >
                          {item.answer}
                        </p>
                      </div>
                    )}

                    {/* Critique / Feedback */}
                    {item.critique && (
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#71717a",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            marginBottom: 8,
                          }}
                        >
                          Feedback
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14.5,
                            lineHeight: 1.7,
                            color: "#a1a1aa",
                          }}
                        >
                          {item.critique}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}