import React, { useMemo, useState } from "react";
import { Link } from "../router/Router.jsx";
import { ArrowRight } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import OffersSlider from "../components/OffersSlider.jsx";
import { useRouter } from "../router/Router.jsx";
import "./ShopPage.css";

export default function ShopPage({ query = "" }) {
  const { products, loading, offline } = useProducts();
  const [sortBy, setSortBy] = useState("featured");
  const { pathname, navigate } = useRouter();
  const category =
    new URLSearchParams(pathname.split("?")[1] || "").get("category") || "All";
  const categories = [
    "All",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];
  const visible = useMemo(() => {
    const result = products.filter(
      (product) =>
        (category === "All" || product.category === category) &&
        `${product.name} ${product.description} ${product.category}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
    return result.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return Number(b.featured) - Number(a.featured);
    });
  }, [products, category, query, sortBy]);

  return (
    <main className="shop-page">
      <OffersSlider />
      <section className="shop-section" id="catalog">
        <Link to="/" className="dashboard-home-link">
          ← Home page
        </Link>
        <div className="section-top">
          <div>
            <div className="eyebrow">THE PICKORA EDIT</div>
            <h2>
              Good things, <em>well found.</em>
            </h2>
            <p>Discover useful finds from trusted partner stores.</p>
          </div>
          <div className="shop-tools">
            <span className="shop-count">{visible.length} products</span>
            <label className="sort-control">
              Sort by{" "}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Customer rating</option>
              </select>
            </label>
          </div>
        </div>
        {offline && (
          <div className="offline-note">
            Demo picks are showing. Connect MongoDB and the API to manage your
            live catalog.
          </div>
        )}
        <div className="filters" aria-label="Filter products by category">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() =>
                navigate(
                  item === "All"
                    ? "/products"
                    : `/products?category=${encodeURIComponent(item)}`,
                  { preserveScroll: true },
                )
              }
            >
              {item}
            </button>
          ))}
        </div>
        {query && (
          <p className="search-summary">Search results for “{query}”</p>
        )}
        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }, (_, index) => (
                <div className="skeleton" key={index} />
              ))
            : visible.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>
        {!loading && !visible.length && (
          <div className="empty">
            No products found. Try a different search or category.
          </div>
        )}
        <a className="shop-back-top" href="#catalog">
          Back to the collection <ArrowRight size={15} />
        </a>
      </section>
    </main>
  );
}
