import { useState } from "react";
import Button from "./Button.jsx";
import { X, ShieldCheck, MapPin, Loader2 } from "lucide-react";

export default function DonorProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  loading = false,
}) {
  const [form, setForm] = useState({
    bloodGroup: initialData?.blood_group || "O+",
    city: initialData?.city || "",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",
    isAvailable:
      initialData?.is_available !== undefined
        ? initialData.is_available
        : true,
  });

  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(
    Boolean(initialData?.latitude && initialData?.longitude)
  );

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setForm((prev) => ({
          ...prev,
          latitude,
          longitude,
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
      setError("Please detect your location before saving your donor profile.");
      return;
    }

    try {
      await onSave({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });

      onClose();
    } catch (err) {
      setError(err.message || "Failed to update donor profile");
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
            <div className="tech-label">DONOR REGISTRY</div>
            <h2 style={{ fontSize: "24px", margin: "2px 0 0" }}>
              DONOR PROFILE
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
          {/* BLOOD GROUP */}
          <div className="form-group">
            <label className="form-label" htmlFor="donor-bg">
              BLOOD GROUP
            </label>

            <select
              id="donor-bg"
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

          {/* CITY */}
          <div className="form-group">
            <label className="form-label" htmlFor="donor-city">
              CITY / DISTRICT
            </label>

            <input
              id="donor-city"
              name="city"
              type="text"
              className="form-input"
              placeholder="e.g. Kodungallur"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          {/* LOCATION */}
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
                  DONATION LOCATION
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
                  <Loader2 size={16} className="spin" />
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

          {/* AVAILABILITY */}
          <div
            className="form-group"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            <input
              id="donor-avail"
              name="isAvailable"
              type="checkbox"
              style={{
                width: "20px",
                height: "20px",
                accentColor: "var(--coral)",
                cursor: "pointer",
              }}
              checked={form.isAvailable}
              onChange={handleChange}
            />

            <label
              htmlFor="donor-avail"
              className="form-label"
              style={{
                cursor: "pointer",
                margin: 0,
              }}
            >
              I AM CURRENTLY AVAILABLE TO DONATE
            </label>
          </div>

          {/* ACTIONS */}
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
              variant="lime"
              type="submit"
              disabled={loading || locationLoading}
              loading={loading}
            >
              SAVE PROFILE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}