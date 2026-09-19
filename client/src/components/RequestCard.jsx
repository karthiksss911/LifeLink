import StatusBadge from "./StatusBadge.jsx";
import Button from "./Button.jsx";
import { MapPin, Users, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function RequestCard({
  request,
  onViewMatches,
  onCancelRequest,
  loadingCancel = false,
  activeRequestId = null,
}) {
  const reqId = request.id || request.request_id;
  const isSelected = activeRequestId === reqId;
  const isCancelled = request.status === "cancelled";
  const isFulfilled = request.status === "fulfilled";
  const canCancel = (request.status === "open" || request.status === "partially_fulfilled") && Boolean(onCancelRequest);

  return (
    <div
      className="editorial-card"
      style={{
        border: "1px solid var(--ink)",
        boxShadow: isSelected ? "8px 8px 0 var(--lime)" : "6px 6px 0 var(--coral)",
        background: isCancelled ? "rgba(240, 240, 240, 0.6)" : "var(--paper-light)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "16px",
        opacity: isCancelled ? 0.75 : 1,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="blood-type-badge">{request.blood_group}</div>
            <div>
              <div className="tech-label">REQUEST ID #{(reqId || "").slice(0, 8)}</div>
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
            <span className="card-info-val">
              {request.units_fulfilled ? `${request.units_fulfilled}/${request.units_required}` : request.units_required} UNITS
            </span>
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

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "16px", alignItems: "center" }}>
        {isCancelled ? (
          <div
            style={{
              padding: "6px 14px",
              background: "#FFE3E3",
              border: "1px solid var(--danger)",
              color: "var(--danger)",
              fontWeight: 700,
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <XCircle size={14} /> CANCELLED
          </div>
        ) : (
          <>
            {onViewMatches && (
              <Button
                variant="secondary"
                size="sm"
                style={{ flex: 1 }}
                onClick={() => onViewMatches && onViewMatches(reqId)}
                icon={Users}
              >
                VIEW MATCHES
              </Button>
            )}

            {canCancel && (
              <Button
                variant="coral"
                size="sm"
                onClick={() => onCancelRequest && onCancelRequest(reqId)}
                disabled={loadingCancel}
                icon={Trash2}
              >
                {loadingCancel ? "CANCELLING..." : "REMOVE REQUEST"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

