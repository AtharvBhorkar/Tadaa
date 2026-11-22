import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const linkClass = ({ isActive }) =>
  `text-sm font-medium ${isActive ? "text-violet-600" : "text-gray-600 hover:text-gray-900"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-2xl font-extrabold text-violet-600">
          Tadaa
        </Link>

        <nav className="flex items-center gap-5">
          <NavLink to="/products" className={linkClass}>Products</NavLink>
          <NavLink to="/mystery" className={linkClass}>Mystery</NavLink>

          {user ? (
            <>
              <span className="hidden text-sm text-gray-500 sm:block">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <Link
                to="/signup"
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}