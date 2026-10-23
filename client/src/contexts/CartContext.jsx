import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
const CartContext = createContext(null);
const readCart = () => {
  try {
    const value = JSON.parse(localStorage.getItem("Pickora-cart") || "[]");
    return Array.isArray(value)
      ? value.filter(
          (x) =>
            x?.product?._id && Number.isInteger(x.quantity) && x.quantity > 0,
        )
      : [];
  } catch {
    return [];
  }
};
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  useEffect(() => {
    try {
      localStorage.setItem("Pickora-cart", JSON.stringify(items));
    } catch {}
  }, [items]);
  const add = (product) =>
    setItems((current) => {
      const existing = current.find((item) => item.product._id === product._id);
      return existing
        ? current.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { product, quantity: 1 }];
    });
  const update = (id, delta) =>
    setItems((current) =>
      current
        .map((item) =>
          item.product._id === id
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  const remove = (id) =>
    setItems((current) => current.filter((item) => item.product._id !== id));
  const clear = () => setItems([]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 5.99;
  const value = useMemo(
    () => ({
      items,
      add,
      update,
      remove,
      clear,
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
    }),
    [items, count, subtotal, shipping],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
