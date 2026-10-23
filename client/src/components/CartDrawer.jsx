import React from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Link } from "../router/Router.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { money } from "../lib/api.js";
import "./CartDrawer.css";
export default function CartDrawer({ open, onClose }) {
  const { items, update, remove, subtotal, shipping, total } = useCart();
  if (!open) return null;
  return (
    <div className="overlay cart-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>Your little bag</h2>
          <button className="close" aria-label="Close bag" onClick={onClose}>
            <X />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={34} />
            <h3>Your bag is taking a breather.</h3>
            <p>There are lovely things waiting to be found.</p>
            <button className="button dark" onClick={onClose}>
              Keep exploring <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {items.map(({ product, quantity }) => (
                <div className="cart-line" key={product._id}>
                  <img src={product.image} alt="" />
                  <div className="cart-line-info">
                    <b>{product.name}</b>
                    <small>{product.category}</small>
                    <div className="qty">
                      <button
                        aria-label="Remove one"
                        onClick={() => update(product._id, -1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span>{quantity}</span>
                      <button
                        aria-label="Add one"
                        onClick={() => update(product._id, 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <strong>{money(product.price * quantity)}</strong>
                  <button
                    className="remove-line"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => remove(product._id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <p>
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </p>
              <p>
                <span>Shipping</span>
                <strong>{shipping ? money(shipping) : "Free"}</strong>
              </p>
              <small>
                {shipping
                  ? "Free shipping on orders over $75."
                  : "Free shipping unlocked."}
              </small>
              <Link
                className="button dark full"
                to="/checkout"
                onClick={onClose}
              >
                Checkout · {money(total)} <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
