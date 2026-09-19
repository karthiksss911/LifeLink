import { useState } from "react";
import StatusBadge from "./StatusBadge.jsx";
import ProtectedContact from "./ProtectedContact.jsx";
import Button from "./Button.jsx";
import { MapPin, Building2, Droplet, ArrowRight, ShieldCheck } from "lucide-react";

export default function MatchCard({
  match,
  role = "donor",
  onAccept,
  onDecline,
  onFetchContact,
  loadingAccept = false,
  loadingDecline = false,
}) {
  const [contactData, setContactData] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactError, setContactError] = useState("");

  const rawStatus = match.status || match.match_status || match.matchStatus || "matched";
  const status = rawStatus.toLowerCase();
  const isAccepted = status === "accepted";
  const isDeclined = status === "declined";
  const bloodGroup = match.blood_group || match.bloodGroup || "O+";
  const distanceKm = match.distance_km || match.distanceKm || "0.0";
  const hospitalName = match.hospital_name || match.city || "District Medical Center";
  const hospitalAddress = match.hospital_address || "";
  const urgency = match.urgency || "normal";
  const unitsRequired = match.units_required || 1;
  const matchId = match.match_id || match.matchId || match.id;

  async function handleViewContact() {
    if (!isAccepted || !onFetchContact || !matchId) return;

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
          <div className="blood-type-badge">{bloodGroup}</div>
          <StatusBadge status={match.status || match.match_status} />
        </div>

        <div style={{ marginTop: "16px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>
            {role === "donor" ? hospitalName : `Donor from ${hospitalName}`}
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
            <span className="card-info-val text-lime">100% MATCH</span>
          </div>
        </div>
      </div>

      <div>
        <ProtectedContact
          isAccepted={isAccepted}
          contact={contactData}
          onFetchContact={handleViewContact}
          loadingContact={loadingContact}
          error={contactError}
        />

        {role === "donor" && !isAccepted && !isDeclined && (
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

        {isAccepted && (
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
