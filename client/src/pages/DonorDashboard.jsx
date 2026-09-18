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
import { Heart, RefreshCw, UserCheck, Activity, ShieldCheck } from "lucide-react";

export default function DonorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [acceptingMatchId, setAcceptingMatchId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Fetch donor profile
      try {
        const profRes = await api.get("/api/donors/profile");
        if (profRes?.profile) {
          setProfile(profRes.profile);
        }
      } catch (err) {
        console.log("No profile yet");
      }

      // 2. Fetch my donor matches
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
            (m.match_id || m.id) === matchId ? { ...m, status: "accepted" } : m
          )
        );
      }
    } catch (err) {
      alert(err.message || "Failed to accept request");
    } finally {
      setAcceptingMatchId(null);
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

              <div style={{ display: "flex", gap: "12px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchDashboardData}
                  disabled={loading}
                  icon={RefreshCw}
                >
                  REFRESH
                </Button>
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => setProfileModalOpen(true)}
                  icon={ShieldCheck}
                >
                  {profile ? "EDIT PROFILE" : "SETUP PROFILE"}
                </Button>
              </div>
            </div>
          </div>

          {/* EDITORIAL STATS GRID */}
          <div className="stats-grid">
            <StatBlock label="TOTAL MATCHES" value={totalMatches.toString().padStart(2, "0")} />
            <StatBlock label="PENDING MATCHES" value={pendingCount.toString().padStart(2, "0")} />
            <StatBlock label="ACCEPTED REQUESTS" value={acceptedCount.toString().padStart(2, "0")} />
            <StatBlock label="LAST DONATION" value="90+ DAYS" subtext="ELIGIBLE TO DONATE" highlight={true} />
          </div>

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
              actionText={!profile ? "CREATE DONOR PROFILE" : undefined}
              onAction={() => setProfileModalOpen(true)}
            />
          ) : (
            <div className="cards-grid">
              {matches.map((m) => (
                <MatchCard
                  key={m.match_id || m.id}
                  match={m}
                  role="donor"
                  onAccept={handleAcceptMatch}
                  loadingAccept={acceptingMatchId === (m.match_id || m.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* DONOR PROFILE MODAL */}
      <DonorProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={profile}
      />
    </div>
  );
}
