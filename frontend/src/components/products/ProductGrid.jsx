import { PackageOpen } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-coral py-16 text-center">
        <PackageOpen size={48} className="text-brand" />
        <p className="font-display text-xl font-extrabold">Koi product nahi mila</p>
        <p className="text-sm font-bold text-ink-soft">Filters ya search badal ke dekh</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}