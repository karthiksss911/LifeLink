import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import MatchCard from "../components/MatchCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { HeartHandshake, RefreshCw } from "lucide-react";

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingMatchId, setAcceptingMatchId] = useState(null);
  const [decliningMatchId, setDecliningMatchId] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, [user]);

  async function fetchMatches() {
    setLoading(true);
    try {
      if (user?.role === "donor") {
        const data = await api.get("/api/my-matches");
        if (data?.matches) {
          setMatches(data.matches);
        }
      } else {
        const requestsData = await api.get("/api/requests/mine");
        if (requestsData?.requests?.length > 0) {
          const allMatches = [];
          for (const req of requestsData.requests) {
            try {
              const res = await api.get(`/api/request-matches/${req.id}`);
              if (res?.matches) {
                const decorated = res.matches.map((m) => ({
                  ...m,
                  hospital_name: req.hospital_name,
                  units_required: req.units_required,
                  urgency: req.urgency,
                }));
                allMatches.push(...decorated);
              }
            } catch (err) {
              // Ignore single request error
            }
          }
          setMatches(allMatches);
        }
      }
    } catch (err) {
      console.log("Error loading matches", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptMatch(matchId) {
    setAcceptingMatchId(matchId);
    try {
      const res = await api.patch(`/api/match-actions/${matchId}/accept`, {});
      if (res?.success) {
        setMatches((prev) =>
          prev.map((m) =>
            (m.match_id || m.matchId || m.id) === matchId ? { ...m, status: "accepted" } : m
          )
        );
      }
    } catch (err) {
      alert(err.message || "Failed to accept match");
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
      alert(err.message || "Failed to decline match");
    } finally {
      setDecliningMatchId(null);
    }
  }

  async function handleFetchContactDetails(matchId) {
    if (!matchId) return null;
    return await api.get(`/api/contacts/${matchId}`);
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container-editorial">
          <SectionHeader
            category="MATCH HISTORY REGISTRY"
            title="Match Dispatches"
            subtitle="Historical and active emergency blood donor dispatches in your district."
            action={
              <Button variant="secondary" size="sm" onClick={fetchMatches} icon={RefreshCw}>
                REFRESH
              </Button>
            }
          />

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
              LOADING MATCH DISPATCHES...
            </div>
          ) : matches.length === 0 ? (
            <EmptyState
              icon={HeartHandshake}
              title="No Match Dispatches Found"
              description="Matches will be listed here when blood requests are processed by the LifeLink algorithm."
            />
          ) : (
            <div className="cards-grid">
              {matches.map((m, idx) => (
                <MatchCard
                  key={m.match_id || m.matchId || m.id || `match-${idx}`}
                  match={m}
                  role={user?.role || "donor"}
                  onAccept={handleAcceptMatch}
                  onDecline={handleDeclineMatch}
                  onFetchContact={handleFetchContactDetails}
                  loadingAccept={acceptingMatchId === (m.match_id || m.matchId || m.id)}
                  loadingDecline={decliningMatchId === (m.match_id || m.matchId || m.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
