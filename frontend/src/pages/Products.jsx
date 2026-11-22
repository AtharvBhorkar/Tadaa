import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Filter,
  Flame,
  Gift,
  Search,
  ShoppingBasket,
  Sparkles,
  Star,
} from "lucide-react";
import { fetchProducts } from "../api/products.api";
import { getErrorMessage } from "../api/axios";
import ProductGrid from "../components/products/ProductGrid";
import FilterSidebar from "../components/products/FilterSidebar";
import Loader from "../components/common/Loader";

const CHIPS = [
  { id: "all", label: "All", params: {} },
  { id: "best", label: "Best Seller", Icon: Flame, params: { badge: "best" } },
  { id: "new", label: "New", Icon: Sparkles, params: { badge: "new" } },
  { id: "under", label: "Under ₹199", Icon: Coins, params: { maxPrice: 199 } },
  { id: "deals", label: "Deals", Icon: Gift, params: { deals: "true" } },
  { id: "top", label: "Top Rated", Icon: Star, params: { sort: "rating" } },
];

const EMPTY_PRICE = { min: "", max: "" };

const pageNumbers = (page, pages) => {
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [chip, setChip] = useState("all");
  const [sort, setSort] = useState("popular");
  const [priceInput, setPriceInput] = useState(EMPTY_PRICE);
  const [price, setPrice] = useState(EMPTY_PRICE);
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // price typing debounce (har keystroke pe API call na jaye)
  useEffect(() => {
    const t = setTimeout(() => {
      setPrice(priceInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [priceInput]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    const chipParams = CHIPS.find((c) => c.id === chip)?.params || {};
    fetchProducts({
      page,
      q: search || undefined,
      category: category || undefined,
      minPrice: price.min || undefined,
      maxPrice: price.max || undefined,
      sort,
      ...chipParams,
    })
      .then((d) => {
        if (cancelled) return;
        setProducts(d.items);
        setTotal(d.total);
        setPages(d.pages);
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [page, search, category, chip, sort, price.min, price.max]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  };

  const changeCategory = (v) => {
    setCategory(v);
    setPage(1);
  };
  const changeChip = (v) => {
    setChip(v);
    setPage(1);
  };
  const changeSort = (v) => {
    setSort(v);
    setPage(1);
  };

  const clearFilters = () => {
    setQ("");
    setSearch("");
    setCategory("");
    setChip("all");
    setSort("popular");
    setPriceInput(EMPTY_PRICE);
    setPrice(EMPTY_PRICE);
    setPage(1);
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 md:px-8 lg:grid-cols-[270px_1fr]">
      {/* SIDEBAR */}
      <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
        <FilterSidebar
          category={category}
          onCategory={changeCategory}
          priceInput={priceInput}
          onPriceInput={setPriceInput}
          sort={sort}
          onSort={changeSort}
          onClear={clearFilters}
        />
      </div>

      <section className="min-w-0">
        {/* BANNER */}
        <div className="relative flex items-center justify-between overflow-hidden rounded-3xl border-2 border-ink bg-linear-to-r from-[#7C3AED] via-[#A855F7] to-[#E27BE8] px-6 py-5 shadow-[4px_4px_0_var(--color-ink)] md:px-10 md:py-7">
          <div>
            <h2 className="font-display text-3xl font-extrabold leading-[1.05] text-white [-webkit-text-stroke:2px_#3D2530] [paint-order:stroke_fill] md:text-5xl">
              Everyday Products
              <br />
              at Tadaa!
            </h2>
            <p className="mt-3 inline-block -rotate-1 bg-sun px-3 py-1 text-xs font-extrabold text-ink md:text-sm">
              Gadgets, Fashion, Home &amp; More
            </p>
          </div>
          <ShoppingBasket
            aria-hidden="true"
            className="hidden h-28 w-28 rotate-6 text-white/90 drop-shadow-[4px_4px_0_#3D2530] sm:block md:h-36 md:w-36"
            strokeWidth={2}
          />
        </div>

        {/* TITLE + SEARCH */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-display text-4xl font-extrabold leading-none">
              Products <Sparkles className="text-sun" size={26} strokeWidth={3} />
            </h1>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              Discover affordable, trending and useful products
            </p>
          </div>

          <form onSubmit={onSearch} className="flex w-full gap-2 md:w-auto">
            <label className="flex flex-1 items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 md:w-80 md:flex-none">
              <Search size={18} strokeWidth={2.8} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent py-2.5 text-sm font-bold outline-none placeholder:text-ink-soft/60"
              />
            </label>
            <button className="rounded-full border-2 border-ink bg-violet px-5 text-sm font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] transition hover:bg-violet-dark active:translate-y-0.5 active:shadow-none">
              Search
            </button>
          </form>
        </div>

        {/* CHIPS */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-cream px-3 py-1.5 text-sm font-extrabold lg:hidden"
          >
            <Filter size={15} strokeWidth={2.8} /> Filters
          </button>

          {CHIPS.map(({ id, label, Icon }) => {
            const active = chip === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => changeChip(id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-4 py-1.5 text-sm font-extrabold transition ${
                  active
                    ? "border-ink bg-violet text-white shadow-[2px_2px_0_var(--color-ink)]"
                    : "border-[#F2B1A8] bg-cream hover:bg-peach"
                }`}
              >
                {Icon && <Icon size={15} strokeWidth={2.8} />}
                {label}
              </button>
            );
          })}

          <span className="ml-auto hidden shrink-0 text-sm font-extrabold text-ink-soft md:block">
            Showing {products.length} of {total} products
          </span>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
            {error}
          </p>
        )}

        <div className="mt-3">
          {loading ? <Loader /> : <ProductGrid products={products} />}
        </div>

        {/* PAGINATION */}
        {pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#F2B1A8] bg-cream disabled:opacity-40"
            >
              <ChevronLeft size={18} strokeWidth={3} />
            </button>

            {pageNumbers(page, pages).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`grid h-10 w-10 place-items-center rounded-xl border-2 text-sm font-extrabold ${
                  n === page
                    ? "border-ink bg-violet text-white shadow-[2px_2px_0_var(--color-ink)]"
                    : "border-[#F2B1A8] bg-cream hover:bg-peach"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pages}
              aria-label="Next page"
              className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#F2B1A8] bg-cream disabled:opacity-40"
            >
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}