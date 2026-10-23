import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";

const ProductsContext = createContext(null);
const sample = [
  [
    "Studio Headphones",
    "Audio",
    89,
    4.9,
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    "Rich, balanced sound and soft over-ear cushions for your daily listening ritual.",
  ],
  [
    "Everyday Camera",
    "Tech",
    129,
    4.8,
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85",
    "A compact camera made for collecting the little moments worth keeping.",
  ],
  [
    "Soft Knit Throw",
    "Home",
    58,
    4.7,
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
    "A cloud-soft, textured throw that makes slow evenings feel even better.",
  ],
  [
    "Sculpted Table Lamp",
    "Home",
    74,
    4.8,
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    "Warm ambient light with a sculptural silhouette for your reading corner.",
  ],
  [
    "Canvas Weekend Tote",
    "Style",
    42,
    4.6,
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85",
    "Roomy, durable canvas with thoughtful pockets for all your everyday carry.",
  ],
  [
    "Ceramic Pour-over Set",
    "Home",
    36,
    4.9,
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
    "Start the day slowly with a handmade-feel brewer and matching cup.",
  ],
  [
    "Minimal Wristwatch",
    "Style",
    115,
    4.7,
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    "Clean lines, a comfortable strap, and reliable timekeeping in one timeless piece.",
  ],
  [
    "Pocket Bluetooth Speaker",
    "Audio",
    64,
    4.8,
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
    "Take a room-filling soundtrack outdoors with a compact, travel-ready speaker.",
  ],
  [
    "Daily Journal",
    "Style",
    24,
    4.6,
    "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85",
    "A calm, tactile space for lists, plans, sketches, and everything in between.",
  ],
  [
    "Desk Companion Stand",
    "Tech",
    39,
    4.5,
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85",
    "Give your workspace a little order with this tidy, adjustable device stand.",
  ],
].map(([name, category, price, rating, image, description], i) => ({
  _id: `demo-${i}`,
  name,
  category,
  price,
  rating,
  image,
  description,
  stock: 12,
  featured: i < 4,
  merchant: "Amazon India",
  affiliateUrl: `https://www.amazon.in/s?k=${encodeURIComponent(name)}`,
}));
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const refresh = async () => {
    const data = await api("/products");
    setProducts(data.products);
    setOffline(false);
    return data.products;
  };
  useEffect(() => {
    setLoading(true);
    refresh()
      .catch(() => {
        setProducts(sample);
        setOffline(true);
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <ProductsContext.Provider
      value={{ products, setProducts, refresh, loading, offline }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
export const useProducts = () => useContext(ProductsContext);
