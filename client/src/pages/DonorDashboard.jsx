import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import StatBlock from "../components/StatBlock.jsx";
import AvailabilityToggle from "../components/AvailabilityToggle.jsx";
import MatchCard from "../components/MatchCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import DonorProfileModal from "../components/DonorProfileModal.jsx";
import Button from "../components/Button.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Heart, RefreshCw, ShieldCheck, MapPin, UserCheck } from "lucide-react";

export default function DonorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [acceptingMatchId, setAcceptingMatchId] = useState(null);
  const [decliningMatchId, setDecliningMatchId] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchDashboardData() {
      const token = localStorage.getItem("lifelink_token");
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Fetch donor profile
        try {
          const profRes = await api.get("/api/donors/profile");
          if (!isCancelled && profRes?.profile) {
            setProfile(profRes.profile);
          }
        } catch (_err) {
          // Profile not created yet
        }

        // 2. Fetch my donor matches
        try {
          const matchRes = await api.get("/api/my-matches");
          if (!isCancelled && matchRes?.matches) {
            setMatches(matchRes.matches);
          }
        } catch (err) {
          if (!isCancelled) {
            console.log("Error fetching matches", err);
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Polling every 10 seconds while Donor Dashboard is active & visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && user?.role === "donor") {
        api.get("/api/my-matches")
          .then((res) => {
            if (res?.matches) {
              setMatches(res.matches);
            }
          })
          .catch(() => {});
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  async function fetchDashboardData() {
    const token = localStorage.getItem("lifelink_token");
    if (!token) return;

    setLoading(true);
    try {
      try {
        const profRes = await api.get("/api/donors/profile");
        if (profRes?.profile) {
          setProfile(profRes.profile);
        }
      } catch (_err) {
        // Profile not created yet
      }

      try {
        const matchRes = await api.get("/api/my-matches");
        if (matchRes?.matches) {
          setMatches(matchRes.matches);
        }
      } catch (err) {
        console.log("Error fetching matches", err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAvailability(newStatus) {
    if (!profile) {
      setProfileModalOpen(true);
      return;
    }

    setUpdatingAvailability(true);
    try {
      const updated = await api.post("/api/donors/profile", {
        bloodGroup: profile.blood_group,
        city: profile.city,
        latitude: Number(profile.latitude),
        longitude: Number(profile.longitude),
        isAvailable: newStatus,
      });

      if (updated?.profile) {
        setProfile(updated.profile);
      }
    } catch (err) {
      alert(err.message || "Failed to update availability status");
    } finally {
      setUpdatingAvailability(false);
    }
  }

  async function handleSaveProfile(profileData) {
    const updated = await api.post("/api/donors/profile", profileData);
    if (updated?.profile) {
      setProfile(updated.profile);
      fetchDashboardData();
    }
  }

  async function handleAcceptMatch(matchId) {
    setAcceptingMatchId(matchId);
    try {
      const res = await api.patch(`/api/match-actions/${matchId}/accept`, {});
      if (res?.success) {
        // Update local state to reflect accepted status
        setMatches((prev) =>
          prev.map((m) =>
            (m.match_id || m.matchId || m.id) === matchId ? { ...m, status: "accepted" } : m
          )
        );
      }
    } catch (err) {
      alert(err.message || "Failed to accept request");
    } finally {
      setAcceptingMatchId(null);
    }
  }

  async function handleDeclineMatch(matchId) {
    setDecliningMatchId(matchId);
    try {
      const res = await api.patch(`/api/match-actions/${matchId}/decline`, {});
      if (res?.success) {
        setMatches((prev) =>
          prev.map((m) =>
            (m.match_id || m.matchId || m.id) === matchId ? { ...m, status: "declined" } : m
          )
        );
      }
    } catch (err) {
      alert(err.message || "Failed to decline request");
    } finally {
      setDecliningMatchId(null);
    }
  }

  // Calculate statistics
  const totalMatches = matches.length;
  const pendingCount = matches.filter(
    (m) => m.status === "matched" || m.status === "notified" || m.status === "viewed"
  ).length;
  const acceptedCount = matches.filter((m) => m.status === "accepted").length;

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container-editorial">
          {/* TOP HERO */}
          <div style={{ marginBottom: "32px" }}>
            <div className="tech-label" style={{ marginBottom: "8px", color: "var(--coral-dark)" }}>
              DISTRICT DONOR DASHBOARD
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <h1 style={{ fontSize: "52px", lineHeight: 1.05, letterSpacing: "-0.04em" }}>
                  Your availability can <br />
                  <span className="text-coral">save a life.</span>
                </h1>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchDashboardData}
                  disabled={loading}
                  icon={RefreshCw}
                >
                  REFRESH
                </Button>
                {!profile && (
                  <Button
                    variant="lime"
                    size="sm"
                    onClick={() => setProfileModalOpen(true)}
                    icon={ShieldCheck}
                  >
                    SET UP DONOR PROFILE
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* READ-ONLY DONOR PROFILE CARD (IF SETUP COMPLETED) */}
          {profile && (
            <div
              style={{
                background: "var(--surface, #f8f9fa)",
                border: "1px solid rgba(20, 32, 28, 0.12)",
                padding: "16px 20px",
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    background: "var(--coral)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "20px",
                    padding: "6px 14px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {profile.blood_group}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <UserCheck size={16} color="var(--lime-dark, #2e7d32)" /> Verified Donor Profile
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(20, 32, 28, 0.65)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} /> {profile.city || "District Location"}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "rgba(20, 32, 28, 0.5)", textTransform: "uppercase" }}>
                Blood Group Verified • One-Time Setup Completed
              </div>
            </div>
          )}

          {/* EDITORIAL STATS GRID */}
          {(() => {
            let lastDonationVal = "NO RECORD";
            let lastDonationSubtext = "ELIGIBLE TO DONATE";
            if (profile?.last_donation_date) {
              const lastDate = new Date(profile.last_donation_date);
              const diffTime = Math.abs(new Date() - lastDate);
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              lastDonationVal = `${diffDays} DAYS AGO`;
              const minInterval = profile.minimum_donation_interval_days || 90;
              if (diffDays < minInterval) {
                lastDonationSubtext = `ELIGIBLE IN ${minInterval - diffDays} DAYS`;
              } else {
                lastDonationSubtext = "ELIGIBLE TO DONATE";
              }
            }
            return (
              <div className="stats-grid">
                <StatBlock label="TOTAL MATCHES" value={totalMatches.toString().padStart(2, "0")} />
                <StatBlock label="PENDING MATCHES" value={pendingCount.toString().padStart(2, "0")} />
                <StatBlock label="ACCEPTED REQUESTS" value={acceptedCount.toString().padStart(2, "0")} />
                <StatBlock label="LAST DONATION" value={lastDonationVal} subtext={lastDonationSubtext} highlight={true} />
              </div>
            );
          })()}

          {/* DONOR STATUS AVAILABILITY PANEL */}
          <div style={{ marginBottom: "40px" }}>
            <AvailabilityToggle
              isAvailable={profile?.is_available ?? false}
              onToggle={handleToggleAvailability}
              loading={updatingAvailability}
            />
          </div>

          {/* MATCH REQUEST CARDS SECTION */}
          <SectionHeader
            category="MATCHING DISPATCHES"
            title="Incoming Emergency Requests"
            subtitle="Review compatible blood requests within your geographical district."
          />

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
              LOADING MATCH DISPATCHES...
            </div>
          ) : matches.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No Pending Match Requests"
              description="There are currently no active blood donation dispatches matching your profile radius. Keep your status set to Available to receive real-time notifications."
              actionText={!profile ? "SET UP DONOR PROFILE" : undefined}
              onAction={!profile ? () => setProfileModalOpen(true) : undefined}
            />
          ) : (
            <div className="cards-grid">
              {matches.map((m, idx) => (
                <MatchCard
                  key={m.match_id || m.matchId || m.id || `match-${idx}`}
                  match={m}
                  role="donor"
                  onAccept={handleAcceptMatch}
                  onDecline={handleDeclineMatch}
                  loadingAccept={acceptingMatchId === (m.match_id || m.matchId || m.id)}
                  loadingDecline={decliningMatchId === (m.match_id || m.matchId || m.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* DONOR PROFILE SETUP MODAL (FIRST-TIME ONLY) */}
      {!profile && (
        <DonorProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onSave={handleSaveProfile}
          initialData={profile}
        />
      )}
    </div>
  );
}

