
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Gift,
  UserRound,
  ShoppingCart,
  ShoppingBag,
  Sparkles
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full
   text-sm font-extrabold transition-all duration-200
   ${
     isActive
       ? "bg-[#B93428] text-[#FFE0C8] border-2 border-[#3D2530] shadow-[3px_3px_0px_#3D2530]"
       : "text-[#3D2530] hover:bg-[#FFE0C8]"
   }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50
      bg-[#FFE0C8] border-b-2 border-[#E88B83]
      shadow-[0_4px_12px_rgba(61,37,48,0.08)]">

      <div className="mx-auto max-w-[1440px]
        h-[76px] px-5 md:px-10
        flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 shrink-0">

          <Gift
            size={34}
            strokeWidth={2.8}
            className="text-[#B93428]"
          />

          <div>
            <p className="font-['Baloo_2']
              text-3xl font-extrabold
              leading-none text-[#B93428]">
              Tadaa<span className="text-[#F6D44A]">✦</span>
            </p>

            <p className="hidden sm:block
              text-[10px] font-extrabold
              text-[#65434B]">
              Kholo aur dekho kya nikla
            </p>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-2 md:gap-4">

          <NavLink
            to="/products"
            className={linkClass}
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">Products</span>
          </NavLink>

          <NavLink
            to="/mystery"
            className={linkClass}
          >
            <Gift size={17} />
            <span>Mystery</span>
          </NavLink>

          {user ? (
            <>
              <span className="hidden lg:block
                text-sm font-bold text-[#65434B]">
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-full border-2
                  border-[#3D2530] px-4 py-2
                  text-sm font-extrabold
                  text-[#3D2530] bg-[#FFE0C8]
                  hover:bg-[#F6B98F] transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={linkClass}
              >
                <UserRound size={17} />
                <span>Login</span>
              </NavLink>

              <Link
                to="/signup"
                className="flex items-center gap-2
                  rounded-xl border-2 border-[#3D2530]
                  bg-[#B93428] text-[#FFE0C8]
                  px-4 py-2 text-sm font-extrabold
                  shadow-[3px_3px_0px_#3D2530]
                  hover:-translate-y-0.5
                  active:translate-y-0.5
                  active:shadow-none transition-all"
              >
                <Sparkles size={16} />
                Sign Up
              </Link>
            </>
          )}

          {/* CART */}
          <Link
            to="/cart"
            aria-label="Shopping cart"
            className="ml-1 relative flex items-center
              justify-center w-11 h-11 rounded-full
              bg-[#FFE0C8] border-2 border-[#3D2530]
              hover:bg-[#F6B98F] transition"
          >
            <ShoppingCart
              size={21}
              className="text-[#3D2530]"
            />
          </Link>

        </nav>
      </div>
    </header>
  );
}
