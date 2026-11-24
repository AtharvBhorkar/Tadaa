import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fetchProducts } from "../../api/products.api";
import ProductGrid from "../products/ProductGrid";

export default function FeaturedProducts() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchProducts({ sort: "popular", limit: 4 })
      .then((d) => !cancelled && setItems(d.items))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-3xl font-extrabold">Popular right now</h2>
        <Link to="/products" className="flex items-center gap-1 text-sm font-extrabold text-violet hover:underline">
          View all <ArrowRight size={16} strokeWidth={3} />
        </Link>
      </div>
      <ProductGrid products={items} />
    </section>
  );
}