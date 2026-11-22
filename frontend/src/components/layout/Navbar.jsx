import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Gift,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserRound,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-extrabold transition-all duration-200 sm:px-4 ${
    isActive
      ? "border-2 border-ink bg-brand text-peach shadow-[3px_3px_0_var(--color-ink)]"
      : "border-2 border-transparent text-ink hover:bg-cream"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-coral bg-peach shadow-[0_4px_12px_rgba(61,37,48,0.08)]">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-3 sm:h-[76px] sm:px-5 md:px-10">
        {/* LOGO */}
        <Link to="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Gift className="h-7 w-7 text-brand sm:h-9 sm:w-9" strokeWidth={2.8} />
          <div>
            <p className="font-display text-2xl font-extrabold leading-none text-brand sm:text-3xl">
              Tadaa<span className="text-sun">✦</span>
            </p>
            <p className="hidden text-[10px] font-extrabold text-ink-soft sm:block">
              Kholo aur dekho kya nikla
            </p>
          </div>
        </Link>

        {/* NAV */}
        <nav className="flex items-center gap-0.5 sm:gap-2 md:gap-3">
          <NavLink to="/products" className={linkClass} aria-label="Products">
            <ShoppingBag size={18} strokeWidth={2.6} />
            <span className="hidden sm:inline">Products</span>
          </NavLink>

          <NavLink to="/mystery" className={linkClass} aria-label="Mystery">
            <Gift size={18} strokeWidth={2.6} />
            <span className="hidden sm:inline">Mystery</span>
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin/products" className={linkClass} aria-label="Admin">
              <ShieldCheck size={18} strokeWidth={2.6} />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          )}

          {user ? (
            <>
              <span className="hidden text-sm font-bold text-ink-soft lg:block">
                Hi, {user.name}
              </span>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="flex items-center gap-2 rounded-full border-2 border-ink bg-peach px-2.5 py-2 text-sm font-extrabold text-ink transition hover:bg-sand sm:px-4"
              >
                <LogOut size={17} strokeWidth={2.6} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} aria-label="Login">
                <UserRound size={18} strokeWidth={2.6} />
                <span className="hidden sm:inline">Login</span>
              </NavLink>

              <Link
                to="/signup"
                aria-label="Sign Up"
                className="flex items-center gap-2 rounded-xl border-2 border-ink bg-brand px-2.5 py-2 text-sm font-extrabold text-peach shadow-[3px_3px_0_var(--color-ink)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none sm:px-4"
              >
                <Sparkles size={17} strokeWidth={2.6} />
                <span className="hidden sm:inline">Sign Up</span>
              </Link>
            </>
          )}

          {/* CART */}
          <Link
            to="/cart"
            aria-label="Shopping cart"
            className="relative ml-0.5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-peach transition hover:bg-sand sm:ml-1 sm:h-11 sm:w-11"
          >
            <ShoppingCart size={20} className="text-ink" strokeWidth={2.6} />
          </Link>
        </nav>
      </div>
    </header>
  );
}