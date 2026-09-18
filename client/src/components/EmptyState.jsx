import Button from "./Button.jsx";

export default function EmptyState({ title, description, actionText, onAction, icon: Icon }) {
  return (
    <div
      className="editorial-card"
      style={{
        textAlign: "center",
        padding: "48px 24px",
        background: "var(--paper-light)",
        border: "1px dashed var(--border-dark)",
      }}
    >
      {Icon && (
        <div
          style={{
            width: "56px",
            height: "56px",
            background: "var(--paper)",
            border: "1px solid var(--ink)",
            boxShadow: "4px 4px 0 var(--coral)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <Icon size={24} />
        </div>
      )}

      <h3 style={{ fontSize: "22px", marginBottom: "8px" }}>{title}</h3>
      {description && (
        <p style={{ color: "var(--ink-soft)", maxWidth: "420px", margin: "0 auto 20px", fontSize: "14px" }}>
          {description}
        </p>
      )}

      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
