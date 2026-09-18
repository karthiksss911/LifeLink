import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";
import { ArrowRight, ShieldCheck, HeartHandshake, UserPlus } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "donor",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleRoleSelect(roleVal) {
    setForm((prev) => ({ ...prev, role: roleVal }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await register(form);
      if (data?.user?.role === "donor") {
        navigate("/donor");
      } else {
        navigate("/requester");
      }
    } catch (err) {
      setError(err.message || "Failed to create account");
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container-editorial">
          <div className="auth-split-container">
            {/* LEFT SIDE HERO */}
            <div>
              <div className="tech-label" style={{ marginBottom: "16px", color: "var(--coral-dark)" }}>
                JOIN THE DISTRICT LIFELINE NETWORK
              </div>

              <h1 className="auth-hero-title">
                Become part of <br />
                <span className="text-coral">the lifeline.</span>
              </h1>

              <p className="auth-hero-subtitle">
                Register as a donor or requester to connect emergency blood requests with eligible
                donors across your district.
              </p>

              {/* WHY LIFE LINK BLOCK */}
              <div className="editorial-card" style={{ boxShadow: "6px 6px 0 var(--lime)", background: "var(--paper-light)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <ShieldCheck size={20} style={{ color: "var(--coral-dark)" }} />
                  <span className="tech-label" style={{ color: "var(--ink)", fontSize: "12px" }}>
                    WHY LIFELINK?
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--ink-soft)" }}>
                  Donors are matched using strict blood-group compatibility matrices, 90-day donation interval eligibility, and real-time location radius verification.
                </p>
              </div>
            </div>

            {/* RIGHT SIDE REGISTRATION PANEL */}
            <div>
              <div className="auth-panel">
                <div className="tech-label" style={{ marginBottom: "8px" }}>
                  NEW REGISTRATION
                </div>

                <h2 style={{ fontSize: "28px", marginBottom: "8px" }}>CREATE ACCOUNT</h2>
                <p className="text-muted" style={{ marginBottom: "20px", fontSize: "14px" }}>
                  Join the district response network today.
                </p>

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
                  {/* ROLE SELECTOR TABS */}
                  <div className="form-group">
                    <label className="form-label">I WANT TO REGISTER AS</label>
                    <div className="role-selector">
                      <div
                        className={`role-tab ${form.role === "donor" ? "active" : ""}`}
                        onClick={() => handleRoleSelect("donor")}
                      >
                        DONOR
                      </div>
                      <div
                        className={`role-tab ${form.role === "requester" ? "active" : ""}`}
                        onClick={() => handleRoleSelect("requester")}
                      >
                        REQUESTER
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="fullName">FULL NAME</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. Jane Doe"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">EMAIL ADDRESS</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">PHONE NUMBER</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 9876543210"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="password">PASSWORD</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="form-input"
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      minLength={8}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="coral"
                    size="lg"
                    style={{ width: "100%", marginTop: "12px" }}
                    disabled={loading}
                    loading={loading}
                  >
                    CREATE ACCOUNT <ArrowRight size={18} />
                  </Button>
                </form>

                <div className="divider-h" style={{ margin: "24px 0" }} />

                <div style={{ textAlign: "center", fontSize: "14px", color: "var(--ink-soft)" }}>
                  Already have an account?{" "}
                  <Link to="/login" style={{ fontWeight: 700, color: "var(--ink)", textDecoration: "underline" }}>
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}