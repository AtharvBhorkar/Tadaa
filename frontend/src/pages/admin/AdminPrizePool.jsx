import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminNav from "../../components/layout/AdminNav";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import {
  adminGetLevels,
  adminGetProducts,
  updateLevelApi,
  addPrizeApi,
  updatePrizeApi,
  deletePrizeApi,
} from "../../api/admin.api";
import { getErrorMessage } from "../../api/axios";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";

const inputClass =
  "rounded-xl border-2 border-ink/30 bg-cream px-3 py-2 text-sm font-bold outline-none focus:border-violet";

function Stat({ label, value, tone = "" }) {
  return (
    <div className="rounded-2xl border-2 border-[#F2B1A8] bg-cream p-3">
      <p className="text-[11px] font-extrabold uppercase text-ink-soft">{label}</p>
      <p className={`font-display text-2xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function LevelPanel({ level, products, onChanged, onError }) {
  const [price, setPrice] = useState(level.price);
  const [count, setCount] = useState(level.productsCount);
  const [addId, setAddId] = useState("");
  const [addWeight, setAddWeight] = useState("10");

  const run = async (fn) => {
    onError("");
    try {
      await fn();
      onChanged();
    } catch (e) {
      onError(getErrorMessage(e));
    }
  };

  const available = products.filter(
    (p) => p.isActive && !level.prizes.some((e) => e.productId === p._id)
  );
  const { stats } = level;

  return (
    <section className="rounded-3xl border-2 border-ink bg-peach p-4 shadow-[4px_4px_0_var(--color-ink)] md:p-5">
      <div className="flex flex-wrap items-end gap-3">
        <h2 className="mr-2 font-display text-2xl font-extrabold">{level.name}</h2>
        <label className="text-xs font-extrabold text-ink-soft">
          Price (₹)
          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`${inputClass} mt-1 block w-24`}
          />
        </label>
        <label className="text-xs font-extrabold text-ink-soft">
          Products per box
          <input
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={`${inputClass} mt-1 block w-24`}
          />
        </label>
        <button
          onClick={() =>
            run(() => updateLevelApi(level._id, { price: Number(price), productsCount: Number(count) }))
          }
          className="rounded-xl border-2 border-ink bg-violet px-4 py-2 text-sm font-extrabold text-white shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none"
        >
          Save
        </button>
        <button
          onClick={() => run(() => updateLevelApi(level._id, { isActive: !level.isActive }))}
          className="rounded-xl border-2 border-ink bg-cream px-4 py-2 text-sm font-extrabold hover:bg-sun"
        >
          {level.isActive ? "Live" : "Hidden"}
        </button>
        <p className="ml-auto text-xs font-extrabold text-ink-soft">
          Min prize value: {formatPrice(level.minPrizeValue)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Expected cost / box" value={formatPrice(stats.expectedCost)} />
        <Stat label="Worst-case cost" value={formatPrice(stats.worstCost)} />
        <Stat label="Fees + packing + claims" value={formatPrice(stats.fees)} />
        <Stat
          label="Net margin / box"
          value={`${formatPrice(stats.netMargin)} (${stats.marginPct}%)`}
          tone={stats.netMargin >= 0 ? "text-green-700" : "text-brand"}
        />
      </div>

      {level.warnings.length > 0 && (
        <ul className="mt-3 space-y-1">
          {level.warnings.map((w) => (
            <li key={w} className="flex items-start gap-1.5 text-xs font-extrabold text-brand">
              <AlertTriangle size={14} strokeWidth={3} className="mt-0.5 shrink-0" /> {w}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-[#F2B1A8] bg-cream">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b-2 border-[#F2B1A8] bg-peach text-xs font-extrabold uppercase text-ink-soft">
            <tr>
              <th className="p-3">Prize</th>
              <th className="p-3">Price</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Weight</th>
              <th className="p-3">Chance</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {level.prizes.map((e) => (
              <tr key={e._id} className={`border-b border-[#F2B1A8]/60 ${e.live ? "" : "opacity-50"}`}>
                <td className="p-3 font-extrabold">
                  {e.title}
                  {!e.meetsRule && (
                    <span className="ml-2 text-[11px] text-brand">below min value</span>
                  )}
                  {e.meetsRule && !e.live && (
                    <span className="ml-2 text-[11px] text-ink-soft">not live (hidden / no stock)</span>
                  )}
                </td>
                <td className="p-3 font-bold">{formatPrice(e.price)}</td>
                <td className="p-3 font-bold">{e.costPrice ? formatPrice(e.costPrice) : "-"}</td>
                <td className="p-3 font-bold">{e.stock}</td>
                <td className="p-3">
                  <input
                    key={`${e._id}-${e.weight}`}
                    type="number"
                    min="0.01"
                    step="any"
                    defaultValue={e.weight}
                    onBlur={(ev) => {
                      const w = Number(ev.target.value);
                      if (w > 0 && w !== e.weight) run(() => updatePrizeApi(e._id, w));
                    }}
                    className={`${inputClass} w-20`}
                  />
                </td>
                <td className="p-3 font-extrabold text-brand">{e.chance}%</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => run(() => deletePrizeApi(e._id))}
                    aria-label="Remove from pool"
                    className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-cream text-brand hover:bg-brand hover:text-white"
                  >
                    <Trash2 size={16} strokeWidth={2.6} />
                  </button>
                </td>
              </tr>
            ))}
            {!level.prizes.length && (
              <tr>
                <td colSpan={7} className="p-6 text-center font-bold text-ink-soft">
                  No prizes in this pool yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 text-xs font-extrabold text-ink-soft">
          Add prize
          <select
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
            className={`${inputClass} mt-1 block w-full`}
          >
            <option value="">Select product...</option>
            {available.map((p) => (
              <option key={p._id} value={p._id} disabled={p.price < level.minPrizeValue}>
                {p.title} — {formatPrice(p.price)}
                {p.price < level.minPrizeValue ? " (below min value)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-extrabold text-ink-soft">
          Weight
          <input
            type="number"
            min="0.01"
            step="any"
            value={addWeight}
            onChange={(e) => setAddWeight(e.target.value)}
            className={`${inputClass} mt-1 block w-24`}
          />
        </label>
        <button
          disabled={!addId}
          onClick={() =>
            run(async () => {
              await addPrizeApi({ levelId: level._id, productId: addId, weight: Number(addWeight) });
              setAddId("");
            })
          }
          className="flex items-center gap-1.5 rounded-xl border-2 border-ink bg-violet px-4 py-2 text-sm font-extrabold text-white shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none disabled:opacity-40"
        >
          <Plus size={16} strokeWidth={3} /> Add
        </button>
      </div>
    </section>
  );
}

export default function AdminPrizePool() {
  const [levels, setLevels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminGetLevels(), adminGetProducts()])
      .then(([lv, pr]) => {
        if (cancelled) return;
        setLevels(lv);
        setProducts(pr.items);
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8">
      <AdminNav />
      <h1 className="font-display text-3xl font-extrabold">Admin: Prize Pool</h1>
      <p className="text-sm font-bold text-ink-soft">
        Weight is relative: chance = weight / total weight of live prizes in that level.{" "}
        <Link to="/admin/products" className="text-violet underline">
          Products
        </Link>
      </p>

      {error && (
        <p className="mt-4 rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
          {error}
        </p>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-5 space-y-6">
          {levels.map((l) => (
            <LevelPanel
              key={`${l._id}-${l.price}-${l.productsCount}`}
              level={l}
              products={products}
              onChanged={() => setTick((t) => t + 1)}
              onError={setError}
            />
          ))}
          {!levels.length && (
            <p className="font-bold text-ink-soft">No levels yet. Run the seed script first.</p>
          )}
        </div>
      )}
    </div>
  );
}