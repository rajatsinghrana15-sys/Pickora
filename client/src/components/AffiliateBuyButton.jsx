import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useRouter } from "../router/Router.jsx";
import { api } from "../lib/api.js";

export default function AffiliateBuyButton({ product, className = "button dark", children }) {
  const { user, loading } = useAuth();
  const { pathname, navigate } = useRouter();
  const [error, setError] = useState("");

  async function buy() {
    setError("");
    if (loading) return;
    if (!user) {
      const returnTo = pathname === "/" || pathname.startsWith("/products")
        ? `/products/${product._id}`
        : pathname;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (!product.affiliateUrl) {
      setError("Seller link is not available for this product.");
      return;
    }
    const sellerTab = window.open("about:blank", "_blank");
    try {
      if (!product._id || product._id.startsWith("demo-"))
        throw new Error("Connect the Pickora API before using seller links.");
      await api("/affiliate-clicks", {
        method: "POST",
        body: JSON.stringify({ productId: product._id }),
      });
      if (sellerTab) {
        sellerTab.opener = null;
        sellerTab.location.replace(product.affiliateUrl);
      } else {
        window.location.assign(product.affiliateUrl);
      }
    } catch (err) {
      sellerTab?.close();
      setError(err.message || "Could not record this seller visit. Try again.");
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={buy} disabled={loading}>
        {children || <><ArrowUpRight size={16} /> Buy Now</>}
      </button>
      {error && <small className="affiliate-buy-error" role="alert">{error}</small>}
    </>
  );
}
