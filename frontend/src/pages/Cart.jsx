import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import useCart from "../hooks/useCart";
import { fetchProductsByIds } from "../api/products.api";
import { getErrorMessage } from "../api/axios";
import { formatPrice } from "../utils/formatPrice";
import Loader from "../components/common/Loader";

export default function Cart() {
  const { items, setQty, remove, clear, maxQty } = useCart();
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(items.length > 0);
  const [error, setError] = useState("");

  const idKey = items
    .map((i) => i.productId)
    .sort()
    .join(",");

  useEffect(() => {
    if (!idKey) return;
    let cancelled = false;
    fetchProductsByIds(idKey.split(","))
      .then((list) => {
        if (!cancelled) setProducts(Object.fromEntries(list.map((p) => [p._id, p])));
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [idKey]);

  const lines = items.map((i) => {
    const p = products[i.productId];
    const available = !!p && p.isActive && p.stock > 0;
    const limit = p ? Math.max(1, Math.min(p.stock, maxQty)) : maxQty;
    const qty = available ? Math.min(i.qty, limit) : i.qty;
    return { productId: i.productId, p, available, qty, limit };
  });

  const payable = lines.filter((l) => l.available);
  const subtotal = payable.reduce((sum, l) => sum + l.p.price * l.qty, 0);
  const totalQty = payable.reduce((sum, l) => sum + l.qty, 0);

  if (loading) return <Loader />;

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <ShoppingCart className="mx-auto text-brand" size={56} strokeWidth={2.2} />
        <h1 className="mt-3 font-display text-3xl font-extrabold">Your cart is empty</h1>
        <p className="mt-1 text-sm font-bold text-ink-soft">Add something you like and it will show up here.</p>
        <Link
          to="/products"
          className="mt-5 inline-block rounded-xl border-2 border-ink bg-violet px-6 py-3 font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] hover:bg-violet-dark active:translate-y-0.5 active:shadow-none"
        >
          Shop products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-3xl font-extrabold">Your cart</h1>
        <button onClick={clear} className="text-sm font-extrabold text-brand hover:underline">
          Clear cart
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_300px]">
        <ul className="space-y-3">
          {lines.map((l) => (
            <li
              key={l.productId}
              className={`flex gap-3 rounded-2xl border-2 border-[#F2B1A8] bg-cream p-3 ${
                l.available ? "" : "opacity-70"
              }`}
            >
              {l.p?.images?.[0] ? (
                <img
                  src={l.p.images[0]}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-xl border-2 border-ink/20 object-cover"
                />
              ) : (
                <div className="h-20 w-20 shrink-0 rounded-xl bg-peach" />
              )}

              <div className="flex min-w-0 flex-1 flex-col">
                {l.p ? (
                  <Link to={`/products/${l.productId}`} className="truncate font-extrabold hover:underline">
                    {l.p.title}
                  </Link>
                ) : (
                  <p className="font-extrabold">Product no longer available</p>
                )}

                {l.p && (
                  <p className="font-display text-xl font-extrabold text-brand">
                    {formatPrice(l.p.price)}
                  </p>
                )}

                {!l.available ? (
                  <p className="text-xs font-extrabold text-brand">
                    {l.p ? "Out of stock or unavailable, it won't be ordered" : "Please remove it"}
                  </p>
                ) : (
                  l.p.stock <= 5 && (
                    <p className="text-xs font-extrabold text-ink-soft">Only {l.p.stock} left</p>
                  )
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  {l.available ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(l.productId, l.qty - 1)}
                        disabled={l.qty <= 1}
                        aria-label="Decrease quantity"
                        className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-cream hover:bg-peach disabled:opacity-40"
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      <span className="w-6 text-center font-extrabold">{l.qty}</span>
                      <button
                        onClick={() => setQty(l.productId, l.qty + 1)}
                        disabled={l.qty >= l.limit}
                        aria-label="Increase quantity"
                        className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-cream hover:bg-peach disabled:opacity-40"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <span />
                  )}

                  <button
                    onClick={() => remove(l.productId)}
                    aria-label="Remove item"
                    className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-cream text-brand hover:bg-brand hover:text-white"
                  >
                    <Trash2 size={15} strokeWidth={2.6} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-3xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_var(--color-ink)]">
          <h2 className="font-display text-xl font-extrabold">Order summary</h2>
          <div className="mt-3 space-y-1.5 text-sm font-bold">
            <div className="flex justify-between">
              <span className="text-ink-soft">Items ({totalQty})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Shipping</span>
              <span className="text-xs">Shown at checkout</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t-2 border-ink/20 pt-3">
            <span className="font-extrabold">Subtotal</span>
            <span className="font-display text-3xl font-extrabold text-brand">{formatPrice(subtotal)}</span>
          </div>

          {payable.length > 0 ? (
            <Link
              to="/checkout"
              className="mt-4 block rounded-xl border-2 border-ink bg-violet px-5 py-3 text-center font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] hover:bg-violet-dark active:translate-y-0.5 active:shadow-none"
            >
              Proceed to checkout
            </Link>
          ) : (
            <p className="mt-4 text-xs font-extrabold text-brand">Nothing available to order.</p>
          )}
        </aside>
      </div>
    </div>
  );
}