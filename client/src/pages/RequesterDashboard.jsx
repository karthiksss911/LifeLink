import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import RequestCard from "../components/RequestCard.jsx";
import MatchCard from "../components/MatchCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import MatchingVisualization from "../components/MatchingVisualization.jsx";
import CreateRequestModal from "../components/CreateRequestModal.jsx";
import Button from "../components/Button.jsx";
import { api } from "../services/api.js";
import { Plus, RefreshCw, Users, Zap, Droplets } from "lucide-react";

export default function RequesterDashboard() {
  const [requests, setRequests] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [requestMatches, setRequestMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  async function fetchMyRequests() {
    setLoading(true);
    try {
      const data = await api.get("/api/requests/mine");
      if (data?.requests) {
        setRequests(data.requests);
        if (data.requests.length > 0 && !activeRequestId) {
          handleViewMatches(data.requests[0].id);
        }
      }
    } catch (err) {
      console.log("Error fetching blood requests", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRequest(formData) {
    const res = await api.post("/api/requests", formData);
    if (res?.request) {
      // Trigger donor matching automatically for the newly created request
      await handleFindDonors(res.request.id);
      await fetchMyRequests();
    }
  }

  async function handleFindDonors(requestId) {
    setMatchingLoading(true);
    setActiveRequestId(requestId);
    try {
      const matchRes = await api.post("/api/matches/find", {
        requestId,
        radiusKm: 25,
      });

      if (matchRes?.matchedDonors) {
        setRequestMatches(matchRes.matchedDonors);
      }
      await handleViewMatches(requestId);
    } catch (err) {
      alert(err.message || "Unable to match donors");
    } finally {
      setMatchingLoading(false);
    }
  }

  async function handleViewMatches(requestId) {
    setActiveRequestId(requestId);
    try {
      const res = await api.get(`/api/request-matches/${requestId}`);
      if (res?.matches) {
        setRequestMatches(res.matches);
      }
    } catch (err) {
      console.log("Error fetching request matches", err);
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
                  onClick={fetchMyRequests}
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
            subtitle="Manage emergency hospital requests and trigger real-time donor matching."
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
                  onFindDonors={handleFindDonors}
                  onViewMatches={handleViewMatches}
                  loadingMatch={matchingLoading && activeRequestId === req.id}
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
            <div style={{ marginTop: "40px" }}>
              <SectionHeader
                category={`MATCH RESULTS FOR REQUEST #${(activeRequest.id || "").slice(0, 8)}`}
                title={`Eligible Donors (${requestMatches.length})`}
                subtitle={`Sorted by proximity to ${activeRequest.hospital_name}. Donor contact details remain protected until accepted.`}
              />

              {requestMatches.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Matched Donors Yet"
                  description="Click 'FIND DONORS' on your blood request card above to run the matching algorithm against registered district donors."
                  actionText="RUN DONOR MATCHING ENGINE →"
                  onAction={() => handleFindDonors(activeRequest.id)}
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
                      onFetchContact={handleFetchContactDetails}
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
