import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/prize-pool", label: "Prize pool" },
];

export default function AdminNav() {
  return (
    <nav className="mb-5 flex gap-2 overflow-x-auto">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `shrink-0 rounded-full border-2 border-ink px-4 py-1.5 text-sm font-extrabold ${
              isActive ? "bg-violet text-white" : "bg-cream hover:bg-sun"
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}