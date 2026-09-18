import { useState } from "react";
import Button from "./Button.jsx";
import { X, ShieldCheck } from "lucide-react";

export default function DonorProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  loading = false,
}) {
  const [form, setForm] = useState({
    bloodGroup: initialData?.blood_group || "O+",
    city: initialData?.city || "Central District",
    latitude: initialData?.latitude || 12.9716,
    longitude: initialData?.longitude || 77.5946,
    isAvailable: initialData?.is_available !== undefined ? initialData.is_available : true,
  });

  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

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
      <div className="modal-editorial" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="tech-label">DONOR REGISTRY</div>
            <h2 style={{ fontSize: "24px", margin: "2px 0 0" }}>DONOR PROFILE</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
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
          <div className="form-group">
            <label className="form-label" htmlFor="donor-bg">BLOOD GROUP</label>
            <select
              id="donor-bg"
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
            <label className="form-label" htmlFor="donor-city">CITY / DISTRICT</label>
            <input
              id="donor-city"
              name="city"
              type="text"
              className="form-input"
              placeholder="e.g. Metro West District"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="donor-lat">LATITUDE</label>
              <input
                id="donor-lat"
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
              <label className="form-label" htmlFor="donor-lng">LONGITUDE</label>
              <input
                id="donor-lng"
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

          <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "12px", marginTop: "12px" }}>
            <input
              id="donor-avail"
              name="isAvailable"
              type="checkbox"
              style={{ width: "20px", height: "20px", accentColor: "var(--coral)", cursor: "pointer" }}
              checked={form.isAvailable}
              onChange={handleChange}
            />
            <label htmlFor="donor-avail" className="form-label" style={{ cursor: "pointer", margin: 0 }}>
              I AM CURRENTLY AVAILABLE TO DONATE
            </label>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button variant="secondary" type="button" onClick={onClose}>
              CANCEL
            </Button>
            <Button variant="lime" type="submit" disabled={loading} loading={loading}>
              SAVE PROFILE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
