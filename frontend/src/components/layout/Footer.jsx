import { Link, useLocation } from "react-router-dom";
import { Gift } from "lucide-react";

const LINKS = [
  { to: "/products", label: "Products" },
  { to: "/mystery", label: "Mystery Box" },
  { to: "/terms", label: "Terms" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refund-policy", label: "Refund & Return Policy" },
  { to: "/contact", label: "Contact" },
];

export default function Footer() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-10 border-t-2 border-coral bg-peach">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="text-brand" size={28} strokeWidth={2.8} />
            <span className="font-display text-2xl font-extrabold text-brand">Tadaa</span>
          </div>
          <p className="mt-1 text-sm font-bold text-ink-soft">Open it and see what you get</p>
        </div>

        <nav className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm font-extrabold">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-brand hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-coral/50 py-3 text-center text-xs font-bold text-ink-soft">
        © {new Date().getFullYear()} Tadaa. All rights reserved.
      </p>
    </footer>
  );
}