import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products.api";
import { getErrorMessage } from "../api/axios";
import ProductGrid from "../components/products/ProductGrid";
import Loader from "../components/common/Loader";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchProducts({ page, q: search || undefined })
      .then((d) => {
        if (cancelled) return;
        setProducts(d.items);
        setPages(d.pages);
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <form onSubmit={onSearch} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-violet-500 sm:w-64"
          />
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
            Search
          </button>
        </form>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? <Loader /> : <ProductGrid products={products} />}

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pages}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}