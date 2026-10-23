import React, { useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { Link, useRouter } from "../router/Router.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { api, money } from "../lib/api.js";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, shipping, total, clear } = useCart();
  const { navigate } = useRouter();
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    line1: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function placeOrder(event) {
    event.preventDefault();
    setError("");
    if (items.some((item) => item.product._id.startsWith("demo-"))) {
      setError(
        "Sample products are for browsing. Start MongoDB and run the seed command to place an order.",
      );
      return;
    }
    setBusy(true);
    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
          shippingAddress: address,
        }),
      });
      clear();
      navigate("/account");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!items.length)
    return (
      <main className="dashboard-page">
        <div className="dashboard-empty">
          <h2>Your bag is empty</h2>
          <Link className="button dark" to="/">
            Continue shopping <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    );
  return (
    <main className="checkout-page">
      <div className="checkout-main">
        <Link className="back-link" to="/">
          <ArrowLeft size={15} /> Back to shopping
        </Link>
        <div className="eyebrow">ONE LAST LITTLE THING</div>
        <h1>
          Where should we <em>send it?</em>
        </h1>
        <p>Cash on delivery. No card details needed.</p>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <form className="form checkout-form" onSubmit={placeOrder}>
          <label>
            Full name
            <input
              autoComplete="name"
              required
              minLength="2"
              value={address.fullName}
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
            />
          </label>
          <label>
            Street address
            <input
              autoComplete="street-address"
              required
              minLength="4"
              value={address.line1}
              onChange={(e) =>
                setAddress({ ...address, line1: e.target.value })
              }
            />
          </label>
          <div className="form-row">
            <label>
              City
              <input
                autoComplete="address-level2"
                required
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />
            </label>
            <label>
              Postal code
              <input
                autoComplete="postal-code"
                required
                minLength="3"
                value={address.postalCode}
                onChange={(e) =>
                  setAddress({ ...address, postalCode: e.target.value })
                }
              />
            </label>
          </div>
          <label>
            Country
            <input
              autoComplete="country-name"
              required
              value={address.country}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
            />
          </label>
          <button className="button dark full" disabled={busy}>
            {busy ? "Placing order…" : "Place cash-on-delivery order"}{" "}
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="checkout-security">
          <LockKeyhole size={14} /> Your order and delivery address are saved
          securely to your account.
        </div>
      </div>
      <aside className="checkout-summary">
        <h2>Your order</h2>
        {items.map(({ product, quantity }) => (
          <div className="summary-product" key={product._id}>
            <img src={product.image} alt="" />
            <div>
              <b>{product.name}</b>
              <small>Qty {quantity}</small>
            </div>
            <strong>{money(product.price * quantity)}</strong>
          </div>
        ))}
        <div className="summary-totals">
          <p>
            <span>Subtotal</span>
            <b>{money(subtotal)}</b>
          </p>
          <p>
            <span>Shipping</span>
            <b>{shipping ? money(shipping) : "Free"}</b>
          </p>
          <p className="grand-total">
            <span>Total due on delivery</span>
            <b>{money(total)}</b>
          </p>
        </div>
      </aside>
    </main>
  );
}
