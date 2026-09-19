import { useState } from "react";
import Button from "./Button.jsx";
import { X, MapPin, Loader2 } from "lucide-react";

export default function CreateRequestModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    bloodGroup: "O+",
    unitsRequired: 2,
    hospitalName: "",
    hospitalAddress: "",
    latitude: "",
    longitude: "",
    urgency: "high",
    notes: "",
  });

  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleUrgencyChange(val) {
    setForm((prev) => ({
      ...prev,
      urgency: val,
    }));
  }

  function getCurrentLocation() {
    setError("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setError("Location services are not supported by this browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));

        setLocationDetected(true);
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);

        if (err.code === 1) {
          setError(
            "Location permission was denied. Please allow location access in your browser."
          );
        } else if (err.code === 2) {
          setError("Your location could not be determined. Please try again.");
        } else {
          setError("Unable to detect your location. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.latitude || !form.longitude) {
      setError("Please detect the hospital/request location before submitting.");
      return;
    }

    try {
      await onSubmit({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        unitsRequired: Number(form.unitsRequired),
      });

      onClose();
    } catch (err) {
      setError(err.message || "Failed to create blood request");
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-editorial"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="tech-label">DISTRICT DISPATCH</div>

            <h2 style={{ fontSize: "24px", margin: "2px 0 0" }}>
              REQUEST BLOOD
            </h2>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "#FFE3E3",
              border: "1px solid var(--danger)",
              color: "var(--danger)",
              marginBottom: "16px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="req-bg">
                BLOOD GROUP
              </label>

              <select
                id="req-bg"
                name="bloodGroup"
                className="form-select"
                value={form.bloodGroup}
                onChange={handleChange}
                required
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req-units">
                UNITS REQUIRED
              </label>

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
            <label className="form-label" htmlFor="req-hosp">
              HOSPITAL NAME
            </label>

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
            <label className="form-label" htmlFor="req-addr">
              HOSPITAL ADDRESS
            </label>

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

          {/* AUTOMATIC LOCATION */}
          <div
            style={{
              border: "1px solid rgba(20, 32, 28, 0.15)",
              padding: "16px",
              marginTop: "8px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <div className="form-label" style={{ marginBottom: "4px" }}>
                  REQUEST LOCATION
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(20, 32, 28, 0.65)",
                  }}
                >
                  Used to find nearby eligible donors.
                </div>
              </div>

              <MapPin size={22} />
            </div>

            <Button
              variant="secondary"
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <>
                  <Loader2 size={16} />
                  DETECTING...
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  {locationDetected
                    ? "UPDATE MY LOCATION"
                    : "USE MY CURRENT LOCATION"}
                </>
              )}
            </Button>

            {locationDetected && (
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--dark)",
                }}
              >
                ✓ Location detected automatically
              </div>
            )}
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
                    className={`urgency-btn ${isSel ? `selected-${urg}` : ""
                      }`}
                    onClick={() => handleUrgencyChange(urg)}
                  >
                    {urg.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="req-notes"
            >
              ADDITIONAL NOTES / MEDICAL DETAILS
            </label>

            <textarea
              id="req-notes"
              name="notes"
              className="form-textarea"
              placeholder="Provide context for eligible donors..."
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "24px",
            }}
          >
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              CANCEL
            </Button>

            <Button
              variant="coral"
              type="submit"
              disabled={loading || locationLoading}
              loading={loading}
            >
              FIND ELIGIBLE DONORS →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}