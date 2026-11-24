import { useEffect, useState } from "react";
import { Eye, Lock } from "lucide-react";
import { fetchLevels } from "../api/mystery.api";
import { getErrorMessage } from "../api/axios";
import { formatPrice } from "../utils/formatPrice";
import Loader from "../components/common/Loader";
import LevelCard from "../components/mystery/LevelCard";
import OddsTable from "../components/mystery/OddsTable";

const TONES = ["bg-mint", "bg-sun", "bg-lilac"];

export default function Mystery() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchLevels()
      .then((data) => {
        if (cancelled) return;
        setLevels(data);
        setSelectedId(data.find((l) => l.prizes.length)?._id || null);
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = levels.find((l) => l._id === selectedId);

  const onPay = () => {
    // payment + spin are built in the next phase
    setNotice("Payment is not live yet. It will be enabled in the next step.");
  };

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <h1 className="font-display text-4xl font-extrabold">Mystery Box</h1>
      <p className="mt-1 text-sm font-bold text-ink-soft">
        Choose a level, check the odds, pay, then spin the wheel to reveal your prize.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
          {error}
        </p>
      )}

      {!error && levels.length === 0 && (
        <p className="mt-6 rounded-3xl border-2 border-dashed border-coral p-10 text-center font-bold text-ink-soft">
          Mystery boxes are coming soon.
        </p>
      )}

      {levels.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {levels.map((l, i) => (
              <LevelCard
                key={l._id}
                level={l}
                tone={TONES[i % TONES.length]}
                selected={l._id === selectedId}
                onSelect={(id) => {
                  setSelectedId(id);
                  setNotice("");
                }}
              />
            ))}
          </div>

          {selected && (
            <div className="mt-8 grid gap-6 md:grid-cols-[1fr_340px]">
              <OddsTable level={selected} />

              <div className="h-fit rounded-3xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_var(--color-ink)]">
                <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink-soft">
                  <Eye size={14} strokeWidth={3} /> Odds are shown above, before you pay
                </p>
                <p className="mt-2 font-display text-4xl font-extrabold text-brand">
                  {formatPrice(selected.price)}
                </p>
                <p className="text-xs font-bold text-ink-soft">
                  + shipping, shown at checkout. Prize value is at least what you pay.
                </p>

                <label className="mt-4 flex cursor-pointer items-start gap-2 text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-violet"
                  />
                  I have seen the odds and understand that mystery items cannot be returned if I
                  simply don't like the prize. Damaged, wrong or missing items are covered by the
                  claim policy.
                </label>

                <button
                  type="button"
                  disabled={!agreed}
                  onClick={onPay}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-violet px-5 py-3 font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] transition hover:bg-violet-dark active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Lock size={16} strokeWidth={3} /> Pay {formatPrice(selected.price)}
                </button>

                {notice && <p className="mt-3 text-xs font-extrabold text-brand">{notice}</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}