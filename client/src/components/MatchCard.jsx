import { useState } from "react";
import StatusBadge from "./StatusBadge.jsx";
import ProtectedContact from "./ProtectedContact.jsx";
import Button from "./Button.jsx";
import { MapPin, Building2, Droplet, ArrowRight, ShieldCheck } from "lucide-react";

export default function MatchCard({
  match,
  role = "donor",
  onAccept,
  onFetchContact,
  loadingAccept = false,
}) {
  const [contactData, setContactData] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);

  const isAccepted = match.status === "accepted" || match.match_status === "accepted";
  const bloodGroup = match.blood_group || match.bloodGroup || "O+";
  const distanceKm = match.distance_km || match.distanceKm || "0.0";
  const hospitalName = match.hospital_name || match.city || "District Medical Center";
  const hospitalAddress = match.hospital_address || "";
  const urgency = match.urgency || "normal";
  const unitsRequired = match.units_required || 1;

  async function handleViewContact() {
    if (onFetchContact) {
      setLoadingContact(true);
      try {
        const res = await onFetchContact(match.match_id || match.id);
        if (res && res.contact) {
          setContactData(res.contact);
        }
      } catch (err) {
        console.error("Failed to fetch contact", err);
      } finally {
        setLoadingContact(false);
      }
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
        />

        {role === "donor" && !isAccepted && (
          <div style={{ marginTop: "16px" }}>
            <Button
              variant="coral"
              size="lg"
              style={{ width: "100%" }}
              onClick={() => onAccept && onAccept(match.match_id || match.id)}
              disabled={loadingAccept}
            >
              ACCEPT REQUEST <ArrowRight size={18} />
            </Button>
          </div>
        )}

        {isAccepted && (
          <div style={{ marginTop: "12px", textAlign: "center" }} className="tech-label text-lime">
            ✓ MATCH ACCEPTED & LOCKED
          </div>
        )}
      </div>
    </div>
  );
}
