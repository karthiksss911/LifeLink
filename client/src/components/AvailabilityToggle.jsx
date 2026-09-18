import { useState } from "react";
import Button from "./Button.jsx";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function AvailabilityToggle({ isAvailable, onToggle, loading = false }) {
  return (
    <div
      className="editorial-card"
      style={{
        background: isAvailable ? "var(--paper-light)" : "var(--paper)",
        border: "1px solid var(--ink)",
        boxShadow: isAvailable ? "8px 8px 0 var(--lime)" : "8px 8px 0 var(--border-dark)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div className="tech-label" style={{ marginBottom: "4px" }}>
          DONOR STATUS
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "28px",
              fontWeight: 800,
              color: isAvailable ? "var(--ink)" : "var(--ink-soft)",
            }}
          >
            {isAvailable ? "AVAILABLE" : "PAUSED"}
          </span>

          <span
            className="badge-editorial"
            style={{
              background: isAvailable ? "var(--lime)" : "var(--border)",
              color: "var(--ink)",
              borderColor: "var(--ink)",
            }}
          >
            {isAvailable ? "ONLINE" : "OFFLINE"}
          </span>
        </div>

        <div className="tech-label" style={{ marginTop: "6px", color: "var(--ink-soft)" }}>
          {isAvailable
            ? "AVAILABLE TO RECEIVE MATCHES IN YOUR DISTRICT"
            : "NOT CURRENTLY RECEIVING MATCH NOTIFICATIONS"}
        </div>
      </div>

      <Button
        variant={isAvailable ? "secondary" : "lime"}
        onClick={() => onToggle(!isAvailable)}
        disabled={loading}
        icon={isAvailable ? ShieldCheck : ShieldAlert}
      >
        {isAvailable ? "PAUSE MATCHING" : "SET AVAILABLE"}
      </Button>
    </div>
  );
}
