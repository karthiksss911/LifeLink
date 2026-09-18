import { Link } from "react-router-dom";

export default function Brand({ showText = true, to = "/" }) {
  return (
    <Link to={to} className="brand-link">
      <div className="brand-badge">L</div>
      {showText && <span className="brand-title">LifeLink</span>}
    </Link>
  );
}
