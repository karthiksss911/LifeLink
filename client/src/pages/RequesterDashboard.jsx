import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar.jsx";
import RequestCard from "../components/RequestCard.jsx";
import MatchCard from "../components/MatchCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import MatchingVisualization from "../components/MatchingVisualization.jsx";
import CreateRequestModal from "../components/CreateRequestModal.jsx";
import Button from "../components/Button.jsx";
import { api } from "../services/api.js";
import { Plus, RefreshCw, Users, Droplets } from "lucide-react";

export default function RequesterDashboard() {
  const [requests, setRequests] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [requestMatches, setRequestMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingRequestId, setCancellingRequestId] = useState(null);
  const [completingMatchId, setCompletingMatchId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const matchesSectionRef = useRef(null);

  useEffect(() => {
    fetchMyRequests(true);
  }, []);

  // Polling every 10 seconds while dashboard is open and visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchMyRequests(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeRequestId]);

  async function fetchMyRequests(isInitial = false) {
    if (isInitial) setLoading(true);
    try {
      const data = await api.get("/api/requests/mine");
      if (data?.requests) {
        setRequests(data.requests);
        const targetReqId = activeRequestId || (data.requests.length > 0 ? data.requests[0].id : null);
        if (targetReqId) {
          fetchRequestMatches(targetReqId);
        }
      }
    } catch (err) {
      console.log("Error fetching blood requests", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  async function fetchRequestMatches(requestId) {
    try {
      const res = await api.get(`/api/request-matches/${requestId}`);
      if (res?.matches) {
        setRequestMatches(res.matches);
      }
    } catch (err) {
      console.log("Error fetching request matches", err);
    }
  }

  async function handleCreateRequest(formData) {
    try {
      // 1. Create the blood request
      const res = await api.post("/api/requests", formData);

      if (!res?.request?.id) {
        throw new Error("Blood request was not created");
      }

      const requestId = res.request.id;

      // 2. Make this request the active request
      setActiveRequestId(requestId);

      // 3. Automatically find eligible donors
      // The requester should NOT have to click "Find Donors".
      await api.post("/api/matches/find", {
        requestId,
        radiusKm: 25,
      });

      // 4. Immediately load the real matches from the database
      await fetchRequestMatches(requestId);

      // 5. Refresh the request list from the database
      await fetchMyRequests(false);

      // 6. Scroll to the real eligible-donor section
      requestAnimationFrame(() => {
        matchesSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (err) {
      console.error("Create/match request error:", err);
      alert(err.message || "Failed to create and match blood request");
      throw err;
    }
  }

  async function handleCancelRequest(requestId) {
    setCancellingRequestId(requestId);
    try {
      const res = await api.patch(`/api/requests/${requestId}/cancel`, {});
      if (res?.success) {
        setRequests((prev) =>
          prev.map((r) =>
            (r.id || r.request_id) === requestId ? { ...r, status: "cancelled" } : r
          )
        );
        fetchMyRequests(false).catch(() => { });
      }
    } catch (err) {
      alert(err.message || "Failed to cancel blood request");
    } finally {
      setCancellingRequestId(null);
    }
  }

  async function handleViewMatches(requestId) {
    setActiveRequestId(requestId);
    await fetchRequestMatches(requestId);
    if (matchesSectionRef.current) {
      matchesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleCompleteMatch(matchId) {
    setCompletingMatchId(matchId);
    try {
      const res = await api.patch(`/api/match-actions/${matchId}/complete`, {});
      if (res?.success) {
        await fetchMyRequests(false);
        if (activeRequestId) {
          await fetchRequestMatches(activeRequestId);
        }
      }
    } catch (err) {
      alert(err.message || "Failed to complete donation");
    } finally {
      setCompletingMatchId(null);
    }
  }

  async function handleFetchContactDetails(matchId) {
    if (!matchId) return null;
    return await api.get(`/api/contacts/${matchId}`);
  }

  const activeRequest = requests.find((r) => r.id === activeRequestId) || requests[0];

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container-editorial">
          {/* TOP HERO */}
          <div style={{ marginBottom: "32px" }}>
            <div className="tech-label" style={{ marginBottom: "8px", color: "var(--coral-dark)" }}>
              REQUESTER DISPATCH CONSOLE
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <h1 style={{ fontSize: "52px", lineHeight: 1.05, letterSpacing: "-0.04em" }}>
                  FIND THE <br />
                  <span className="text-coral">RIGHT DONOR.</span>
                </h1>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchMyRequests(true)}
                  disabled={loading}
                  icon={RefreshCw}
                >
                  REFRESH
                </Button>
                <Button
                  variant="coral"
                  size="lg"
                  onClick={() => setCreateModalOpen(true)}
                  icon={Plus}
                >
                  REQUEST BLOOD
                </Button>
              </div>
            </div>
          </div>

          {/* ACTIVE REQUESTS CARDS SECTION */}
          <SectionHeader
            category="ACTIVE DISPATCH REQUESTS"
            title="Your Blood Requests"
            subtitle="Manage emergency hospital requests and view matched eligible donors."
          />

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
              LOADING REQUESTS...
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={Droplets}
              title="No Active Blood Requests"
              description="Create a blood dispatch request to automatically search and notify nearby compatible donors in your district."
              actionText="CREATE FIRST BLOOD REQUEST"
              onAction={() => setCreateModalOpen(true)}
            />
          ) : (
            <div className="cards-grid" style={{ marginBottom: "40px" }}>
              {requests.map((req, idx) => (
                <RequestCard
                  key={req.id || req.request_id || `req-${idx}`}
                  request={req}
                  onViewMatches={handleViewMatches}
                  onCancelRequest={handleCancelRequest}
                  loadingCancel={cancellingRequestId === (req.id || req.request_id)}
                  activeRequestId={activeRequestId}
                />
              ))}
            </div>
          )}

          {/* MATCHING ALGORITHM VISUALIZATION */}
          {activeRequest && (
            <div key={`vis-${activeRequest.id}`}>
              <div className="divider-h-strong" />
              <MatchingVisualization activeStep={4} />
            </div>
          )}

          {/* MATCHED DONORS RESULTS */}
          {activeRequest && (
            <div style={{ marginTop: "40px" }} ref={matchesSectionRef}>
              <SectionHeader
                category={`MATCH RESULTS FOR REQUEST #${(activeRequest.id || "").slice(0, 8)}`}
                title={`Eligible Donors (${requestMatches.length})`}
                subtitle={`Sorted by proximity to ${activeRequest.hospital_name}. Donor contact details remain protected until accepted.`}
              />

              {requestMatches.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Eligible Donors Yet"
                  description="Your request is active. We'll continue checking for eligible donors matching your district radius."
                />
              ) : (
                <div className="cards-grid">
                  {requestMatches.map((m, idx) => (
                    <MatchCard
                      key={m.match_id || m.matchId || m.id || m.donor_id || m.donorId || `match-${idx}`}
                      match={{
                        ...m,
                        units_required: activeRequest.units_required,
                        urgency: activeRequest.urgency,
                        hospital_name: activeRequest.hospital_name,
                      }}
                      role="requester"
                      onCompleteMatch={handleCompleteMatch}
                      onFetchContact={handleFetchContactDetails}
                      loadingComplete={completingMatchId === (m.match_id || m.matchId || m.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* CREATE BLOOD REQUEST MODAL */}
      <CreateRequestModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
}

