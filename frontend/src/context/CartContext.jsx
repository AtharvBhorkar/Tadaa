import { createContext, useEffect, useMemo, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext(null);

const KEY = "tadaa_cart";
const MAX_QTY = 10;

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(raw)) return [];
    return raw.filter((i) => i && typeof i.productId === "string" && i.qty > 0);
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // storage full or blocked, cart still works for this session
    }
  }, [items]);

  const add = (productId, qty = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i.productId === productId);
      if (found) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i
        );
      }
      return [...prev, { productId, qty: Math.min(MAX_QTY, qty) }];
    });

  const setQty = (productId, qty) =>
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : i
      )
    );

  const remove = (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId));
  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, count, add, setQty, remove, clear, maxQty: MAX_QTY }}>
      {children}
    </CartContext.Provider>
  );
}