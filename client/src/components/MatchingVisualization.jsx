import { Check } from "lucide-react";

export default function MatchingVisualization({ activeStep = 4 }) {
  const steps = [
    { num: "01", title: "BLOOD GROUP", desc: "Compatibility Matrix" },
    { num: "02", title: "LOCATION", desc: "Geographic Radius" },
    { num: "03", title: "DONATION INTERVAL", desc: "90-Day Eligibility" },
    { num: "04", title: "AVAILABILITY", desc: "Active Donor Status" },
  ];

  return (
    <div style={{ margin: "24px 0" }}>
      <div className="tech-label" style={{ marginBottom: "8px" }}>
        MATCHING ENGINE ALGORITHM
      </div>
      <div className="matching-stepper">
        {steps.map((step, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep - 1;

          return (
            <div
              key={step.num}
              className={`stepper-item ${isCurrent || isDone ? "active" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="stepper-num">{step.num}</span>
                {isDone && <Check size={14} style={{ color: "var(--ink)" }} />}
              </div>
              <div className="stepper-title">{step.title}</div>
              <div style={{ fontSize: "11px", color: "var(--ink-soft)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
