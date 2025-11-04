import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav style={{ padding: "1rem", background: "#f2f2f2" }}>
      <Link to="/sheets" style={{ marginRight: "1rem" }}>
        Home
      </Link>

      {isLoggedIn ? (
        <>
          <Link to="/dashboard" style={{ marginRight: "1rem" }}>
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <Link to="/auth" style={{ marginRight: "1rem" }}>
          Login / Signup
        </Link>
      )}
    </nav>
  );
}
