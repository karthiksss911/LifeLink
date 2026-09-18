import { Lock, Unlock, Phone, Mail, UserCheck } from "lucide-react";

export default function ProtectedContact({ isAccepted, contact, onFetchContact, loadingContact }) {
  if (!isAccepted) {
    return (
      <div className="protected-contact-box">
        <Lock size={16} style={{ color: "var(--coral-dark)", flexShrink: 0 }} />
        <div>
          <div className="tech-label" style={{ color: "var(--ink)" }}>CONTACT PROTECTED</div>
          <div style={{ fontSize: "12px", color: "var(--ink-soft)", margin: 0 }}>
            Contact information is revealed only after the match is accepted.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="protected-contact-box unlocked">
      <Unlock size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div className="tech-label" style={{ color: "var(--success)" }}>
            CONTACT DETAILS UNLOCKED
          </div>
          {!contact && onFetchContact && (
            <button
              onClick={onFetchContact}
              disabled={loadingContact}
              style={{
                background: "var(--ink)",
                color: "var(--paper)",
                border: 0,
                padding: "3px 8px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {loadingContact ? "FETCHING..." : "VIEW CONTACT"}
            </button>
          )}
        </div>

        {contact ? (
          <div style={{ marginTop: "8px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <UserCheck size={14} /> {contact.full_name || "Donor Contact"}
            </div>
            {contact.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)" }}>
                <Phone size={13} /> <a href={`tel:${contact.phone}`} style={{ textDecoration: "underline" }}>{contact.phone}</a>
              </div>
            )}
            {contact.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)" }}>
                <Mail size={13} /> <a href={`mailto:${contact.email}`} style={{ textDecoration: "underline" }}>{contact.email}</a>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" }}>
            Click button above to view revealed phone & email.
          </div>
        )}
      </div>
    </div>
  );
}
