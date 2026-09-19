import { useState } from "react";
import StatusBadge from "./StatusBadge.jsx";
import ProtectedContact from "./ProtectedContact.jsx";
import Button from "./Button.jsx";
import { MapPin, Building2, Droplet, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function MatchCard({
  match,
  role = "donor",
  onAccept,
  onDecline,
  onCompleteMatch,
  onFetchContact,
  loadingAccept = false,
  loadingDecline = false,
  loadingComplete = false,
}) {
  const [contactData, setContactData] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactError, setContactError] = useState("");

  const rawStatus = match.status || match.match_status || match.matchStatus || "matched";
  const status = rawStatus.toLowerCase();
  const isAccepted = status === "accepted";
  const isDeclined = status === "declined";
  const isCompleted = status === "completed";
  const bloodGroup = match.blood_group || match.bloodGroup || "";
  const distanceKm = match.distance_km != null ? match.distance_km : (match.distanceKm != null ? match.distanceKm : "N/A");
  const hospitalName = match.hospital_name || match.hospitalName || (match.city ? `Hospital in ${match.city}` : "Hospital/Location Unspecified");
  const hospitalAddress = match.hospital_address || match.hospitalAddress || "";
  const urgency = match.urgency || "normal";
  const unitsRequired = match.units_required || 1;
  const matchId = match.match_id || match.matchId || match.id;

  async function handleViewContact() {
    if ((!isAccepted && !isCompleted) || !onFetchContact || !matchId) return;

    setContactError("");
    setLoadingContact(true);
    try {
      const res = await onFetchContact(matchId);
      if (res && res.contact) {
        setContactData(res.contact);
      } else {
        setContactError(res?.message || "Unable to fetch donor contact");
      }
    } catch (err) {
      setContactError(err.message || "Failed to fetch contact");
    } finally {
      setLoadingContact(false);
    }
  }

  return (
    <div className="editorial-match-card">
      <div>
        <div className="card-header-row">
          <div className="blood-type-badge">{bloodGroup || "—"}</div>
          <StatusBadge status={match.status || match.match_status} />
        </div>

        <div style={{ marginTop: "16px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>
            {role === "donor"
              ? hospitalName
              : (match.donor_name || match.donorName || (match.city ? `Donor from ${match.city}` : "Matched Donor"))}
          </h3>
          {hospitalAddress && (
            <div style={{ fontSize: "13px", color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={13} /> {hospitalAddress}
            </div>
          )}
        </div>

        <div className="card-info-grid" style={{ marginTop: "16px" }}>
          <div className="card-info-item">
            <span className="tech-label">DISTANCE</span>
            <span className="card-info-val">{distanceKm} KM</span>
          </div>

          <div className="card-info-item">
            <span className="tech-label">UNITS</span>
            <span className="card-info-val">{unitsRequired} UNITS</span>
          </div>

          <div className="card-info-item">
            <span className="tech-label">URGENCY</span>
            <span
              className="card-info-val"
              style={{
                color: urgency === "critical" || urgency === "high" ? "var(--coral-dark)" : "var(--ink)",
                textTransform: "uppercase",
              }}
            >
              {urgency}
            </span>
          </div>

          <div className="card-info-item">
            <span className="tech-label">ELIGIBILITY</span>
            <span className="card-info-val text-lime">ELIGIBLE</span>
          </div>
        </div>
      </div>

      <div>
        {role === "requester" && (
          <ProtectedContact
            isAccepted={isAccepted || isCompleted}
            contact={contactData}
            onFetchContact={handleViewContact}
            loadingContact={loadingContact}
            error={contactError}
          />
        )}

        {role === "donor" && !isAccepted && !isDeclined && !isCompleted && (
          <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
            <Button
              variant="coral"
              size="lg"
              style={{ flex: 1 }}
              onClick={() => onAccept && onAccept(matchId)}
              disabled={loadingAccept || loadingDecline}
            >
              ACCEPT <ArrowRight size={16} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              style={{ flex: 1 }}
              onClick={() => onDecline && onDecline(matchId)}
              disabled={loadingAccept || loadingDecline}
            >
              DECLINE
            </Button>
          </div>
        )}

        {role === "requester" && isAccepted && onCompleteMatch && (
          <div style={{ marginTop: "16px" }}>
            <Button
              variant="lime"
              size="lg"
              style={{ width: "100%" }}
              onClick={() => onCompleteMatch && onCompleteMatch(matchId)}
              disabled={loadingComplete}
            >
              {loadingComplete ? "COMPLETING..." : "MARK DONATION COMPLETED"}
            </Button>
          </div>
        )}

        {isCompleted && (
          <div
            style={{
              marginTop: "16px",
              padding: "10px",
              background: "rgba(132, 204, 22, 0.15)",
              border: "1px solid var(--lime)",
              textAlign: "center",
              fontWeight: 700,
              fontSize: "13px",
              color: "var(--lime-dark, #2e7d32)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
            className="tech-label"
          >
            <CheckCircle2 size={16} /> ✓ DONATION COMPLETED
          </div>
        )}

        {isAccepted && !isCompleted && role === "donor" && (
          <div style={{ marginTop: "12px", textAlign: "center" }} className="tech-label text-lime">
            ✓ MATCH ACCEPTED & LOCKED
          </div>
        )}

        {isDeclined && (
          <div style={{ marginTop: "12px", textAlign: "center", color: "var(--coral-dark)" }} className="tech-label">
            ✕ REQUEST DECLINED
          </div>
        )}
      </div>
    </div>
  );
}

