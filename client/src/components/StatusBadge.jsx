export default function StatusBadge({ status, type = "request" }) {
  const normalized = (status || "").toLowerCase();

  let badgeClass = "badge-dark";

  if (normalized === "open" || normalized === "matched") {
    badgeClass = "badge-coral";
  } else if (normalized === "notified" || normalized === "viewed") {
    badgeClass = "badge-warning";
  } else if (normalized === "accepted" || normalized === "fulfilled") {
    badgeClass = "badge-lime";
  } else if (normalized === "cancelled" || normalized === "expired") {
    badgeClass = "badge-danger";
  }

  return (
    <span className={`badge-editorial ${badgeClass}`}>
      <span style={{ fontSize: "8px", lineHeight: 1 }}>●</span>
      {status || "UNKNOWN"}
    </span>
  );
}
