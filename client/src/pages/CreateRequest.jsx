import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Button from "../components/Button.jsx";
import { api } from "../services/api.js";
import { ArrowRight, AlertTriangle } from "lucide-react";

export default function CreateRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bloodGroup: "O+",
    unitsRequired: 2,
    hospitalName: "City General Hospital",
    hospitalAddress: "742 Evergreen Terrace, Central District",
    latitude: 12.9716,
    longitude: 77.5946,
    urgency: "high",
    notes: "Urgent surgical requirement. Donor needed within 4 hours.",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleUrgencyChange(val) {
    setForm((prev) => ({ ...prev, urgency: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/requests", {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        unitsRequired: Number(form.unitsRequired),
      });

      if (res?.request) {
        // Trigger matching
        try {
          await api.post("/api/matches/find", {
            requestId: res.request.id,
            radiusKm: 25,
          });
        } catch (mErr) {
          console.log("Matching error", mErr);
        }
        navigate("/requester");
      }
    } catch (err) {
      setError(err.message || "Failed to create blood request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container-editorial">
          <SectionHeader
            category="DISTRICT EMERGENCY DISPATCH"
            title="Request Blood"
            subtitle="Submit an emergency blood request to automatically locate and notify nearby compatible donors."
          />

          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div className="editorial-card shadow-coral-lg">
              {error && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "#FFE3E3",
                    border: "1px solid var(--danger)",
                    color: "var(--danger)",
                    marginBottom: "20px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="req-bg">BLOOD GROUP</label>
                    <select
                      id="req-bg"
                      name="bloodGroup"
                      className="form-select"
                      value={form.bloodGroup}
                      onChange={handleChange}
                      required
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="req-units">UNITS REQUIRED</label>
                    <input
                      id="req-units"
                      name="unitsRequired"
                      type="number"
                      min="1"
                      max="20"
                      className="form-input"
                      value={form.unitsRequired}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="req-hosp">HOSPITAL NAME</label>
                  <input
                    id="req-hosp"
                    name="hospitalName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. St. Jude Memorial Hospital"
                    value={form.hospitalName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="req-addr">HOSPITAL ADDRESS</label>
                  <input
                    id="req-addr"
                    name="hospitalAddress"
                    type="text"
                    className="form-input"
                    placeholder="Street address & Landmark"
                    value={form.hospitalAddress}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="req-lat">LATITUDE</label>
                    <input
                      id="req-lat"
                      name="latitude"
                      type="number"
                      step="any"
                      className="form-input"
                      value={form.latitude}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="req-lng">LONGITUDE</label>
                    <input
                      id="req-lng"
                      name="longitude"
                      type="number"
                      step="any"
                      className="form-input"
                      value={form.longitude}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">URGENCY LEVEL</label>
                  <div className="urgency-selector">
                    {["low", "normal", "high", "critical"].map((urg) => {
                      const isSel = form.urgency === urg;
                      return (
                        <button
                          type="button"
                          key={urg}
                          className={`urgency-btn ${isSel ? `selected-${urg}` : ""}`}
                          onClick={() => handleUrgencyChange(urg)}
                        >
                          {urg.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="req-notes">ADDITIONAL NOTES / MEDICAL DETAILS</label>
                  <textarea
                    id="req-notes"
                    name="notes"
                    className="form-textarea"
                    placeholder="Provide context for eligible donors..."
                    value={form.notes}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                  <Button variant="secondary" type="button" onClick={() => navigate("/requester")}>
                    CANCEL
                  </Button>
                  <Button variant="coral" type="submit" disabled={loading} loading={loading}>
                    FIND ELIGIBLE DONORS <ArrowRight size={18} />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
