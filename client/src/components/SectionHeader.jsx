export default function SectionHeader({ category, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      {category && <div className="tech-label" style={{ marginBottom: "6px" }}>{category}</div>}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "32px", letterSpacing: "-0.03em" }}>{title}</h2>
          {subtitle && <p className="text-muted" style={{ margin: "6px 0 0", fontSize: "14px" }}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="divider-h" style={{ margin: "16px 0 0" }} />
    </div>
  );
}
