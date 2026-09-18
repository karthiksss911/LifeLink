export default function StatBlock({ label, value, subtext, highlight = false }) {
  return (
    <div className={`stat-item ${highlight ? "bg-paper-light" : ""}`}>
      <div className="stat-number">{value}</div>
      <div>
        <div className="stat-label">{label}</div>
        {subtext && <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" }}>{subtext}</div>}
      </div>
    </div>
  );
}
