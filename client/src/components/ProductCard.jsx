import React from "react";
import { Star } from "lucide-react";
import { Link } from "../router/Router.jsx";
import { money } from "../lib/api.js";
import AffiliateBuyButton from "./AffiliateBuyButton.jsx";
import "./ProductCard.css";
export default function ProductCard({ product }) {
  return (
    <article className="product">
      <Link className="product-image" to={`/products/${product._id}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-tag">
          {product.featured ? "THE EDIT" : product.category.toUpperCase()}
        </span>
      </Link>
      <AffiliateBuyButton product={product} className="quick-add" />
      <div className="product-info">
        <div>
          <Link to={`/products/${product._id}`}>
            <h3>{product.name}</h3>
          </Link>
          <p>{product.category}</p>
        </div>
        <strong>{money(product.price)}</strong>
      </div>
      <div className="rating">
        <Star size={12} fill="currentColor" />{" "}
        {Number(product.rating || 4.7).toFixed(1)} <span>·</span>
        <span>{product.merchant || "Partner store"} · Affiliate link</span>
      </div>
    </article>
  );
}
