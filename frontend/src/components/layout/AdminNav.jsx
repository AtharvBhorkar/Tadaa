import { NavLink, Outlet } from "react-router-dom";
import { Gift, Package, ShoppingBag } from "lucide-react";

const LINKS = [
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/prize-pool", label: "Prize pool", icon: Gift },
];

const linkClass = ({ isActive }) =>
  `flex shrink-0 items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-extrabold transition ${
    isActive
      ? "border-ink bg-violet text-white shadow-[2px_2px_0_var(--color-ink)]"
      : "border-transparent text-ink hover:bg-peach"
  }`;

export function AdminSidebar() {
  return (
    <aside className="border-b-2 border-ink/10 bg-cream md:sticky md:top-[76px] md:h-[calc(100vh-76px)] md:w-56 md:shrink-0 md:border-b-0 md:border-r-2">
      <p className="hidden px-4 pt-5 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft md:block">
        Admin panel
      </p>
      <nav className="flex gap-2 overflow-x-auto p-3 md:flex-col md:overflow-visible">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={18} strokeWidth={2.6} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-76px)] flex-col md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}