import StatusBadge from "./StatusBadge.jsx";
import Button from "./Button.jsx";
import { MapPin, Users, Zap, Clock } from "lucide-react";

export default function RequestCard({
  request,
  onFindDonors,
  onViewMatches,
  loadingMatch = false,
  activeRequestId = null,
}) {
  const isSelected = activeRequestId === request.id;

  return (
    <div
      className="editorial-card"
      style={{
        border: "1px solid var(--ink)",
        boxShadow: isSelected ? "8px 8px 0 var(--lime)" : "6px 6px 0 var(--coral)",
        background: "var(--paper-light)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="blood-type-badge">{request.blood_group}</div>
            <div>
              <div className="tech-label">REQUEST ID #{request.id.slice(0, 8)}</div>
              <h3 style={{ fontSize: "20px", margin: "2px 0 0" }}>{request.hospital_name}</h3>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
          <MapPin size={14} /> {request.hospital_address}
        </div>

        {request.notes && (
          <div style={{ fontSize: "13px", fontStyle: "italic", background: "var(--paper)", padding: "8px 12px", border: "1px solid var(--border)", margin: "8px 0" }}>
            "{request.notes}"
          </div>
        )}

        <div className="card-info-grid" style={{ marginTop: "12px" }}>
          <div className="card-info-item">
            <span className="tech-label">UNITS REQUIRED</span>
            <span className="card-info-val">{request.units_required} UNITS</span>
          </div>

          <div className="card-info-item">
            <span className="tech-label">URGENCY</span>
            <span
              className="card-info-val"
              style={{
                color: request.urgency === "critical" || request.urgency === "high" ? "var(--coral-dark)" : "var(--ink)",
                textTransform: "uppercase",
              }}
            >
              {request.urgency}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
        <Button
          variant="primary"
          size="sm"
          style={{ flex: 1 }}
          onClick={() => onFindDonors(request.id)}
          disabled={loadingMatch}
          icon={Zap}
        >
          {loadingMatch ? "MATCHING..." : "FIND DONORS →"}
        </Button>

        {onViewMatches && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewMatches(request.id)}
            icon={Users}
          >
            VIEW MATCHES
          </Button>
        )}
      </div>
    </div>
  );
}
