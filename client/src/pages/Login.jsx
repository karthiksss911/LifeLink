import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Button from "../components/Button.jsx";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await login(form.email, form.password);
      if (data?.user?.role === "donor") {
        navigate("/donor");
      } else {
        navigate("/requester");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
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
                DISTRICT BLOOD DONOR MATCHING / 2026
              </div>

              <h1 className="auth-hero-title">
                Blood connects <br />
                <span className="text-coral">people.</span>
              </h1>

              <p className="auth-hero-subtitle">
                LifeLink connects eligible blood donors with nearby emergency requests using
                real-time compatibility, geographic distance, and 90-day interval rules.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  padding: "20px",
                  background: "var(--paper-light)",
                  border: "1px solid var(--border-dark)",
                  boxShadow: "6px 6px 0 var(--ink)",
                  maxWidth: "480px",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800 }}>
                    100%
                  </div>
                  <div className="tech-label">PRIVATE CONTACTS</div>
                </div>

                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "var(--coral)" }}>
                    &lt; 25 KM
                  </div>
                  <div className="tech-label">RADIUS MATCHING</div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE PANEL */}
            <div>
              <div className="auth-panel">
                <div className="tech-label" style={{ marginBottom: "8px" }}>
                  ACCOUNT AUTHENTICATION
                </div>

                <h2 style={{ fontSize: "28px", marginBottom: "8px" }}>WELCOME BACK</h2>
                <p className="text-muted" style={{ marginBottom: "24px", fontSize: "14px" }}>
                  Sign in to manage your blood donation activity and active dispatches.
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
                    <label className="form-label" htmlFor="password">PASSWORD</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="form-input"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    style={{ width: "100%", marginTop: "12px" }}
                    disabled={loading}
                    loading={loading}
                  >
                    SIGN IN <ArrowRight size={18} />
                  </Button>
                </form>

                <div className="divider-h" style={{ margin: "24px 0" }} />

                <div style={{ textAlign: "center", fontSize: "14px", color: "var(--ink-soft)" }}>
                  Don't have an account?{" "}
                  <Link to="/register" style={{ fontWeight: 700, color: "var(--ink)", textDecoration: "underline" }}>
                    Create account
                  </Link>
                </div>

                {/* PRIVACY NOTICE BLOCK */}
                <div className="privacy-notice-box">
                  <Lock size={16} style={{ color: "var(--coral-dark)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "11px", color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
                      YOUR PRIVACY MATTERS
                    </div>
                    <p>
                      Your contact information stays private until a donor accepts a match request.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}