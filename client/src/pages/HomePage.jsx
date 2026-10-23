import React from "react";
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { Link } from "../router/Router.jsx";
import { useProducts } from "../contexts/ProductsContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import "./HomePage.css";

const categories = ["Home", "Style", "Tech", "Audio"];

export default function HomePage() {
  const { products, loading } = useProducts();
  const picks = products;

  return (
    <main className="market-home">
      <section className="market-hero">
        <div className="market-hero-copy">
          <span className="market-kicker">PICKORA FINDS · UPDATED WEEKLY</span>
          <h1>
            Good picks.
            <br />
            <em>Easy shopping.</em>
          </h1>
          <p>
            Discover everyday products across home, style, tech, and more.
            Compare the details, then shop directly with the seller.
          </p>
          <Link className="market-primary-button" to="/products">
            Explore all products <ArrowRight size={17} />
          </Link>
        </div>
        <div className="market-hero-visual">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"
            alt="A warmly styled living room"
          />
          <div className="market-hero-caption">
            <b>Home favourites</b>
            <span>Thoughtful finds for every day</span>
          </div>
        </div>
      </section>

      <section className="market-category-panel">
        <div className="market-section-heading">
          <div>
            <span className="market-kicker">BROWSE PICKORA</span>
            <h2>Shop by category</h2>
          </div>
          <Link to="/products">
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="market-category-grid">
          {categories.map((category, index) => {
            const image = products.find(
              (product) => product.category === category,
            )?.image;
            return (
              <Link
                className={`market-category-tile category-${index}`}
                key={category}
                preserveScroll
                to={`/products?category=${encodeURIComponent(category)}`}
              >
                {image && <img src={image} alt="" loading="lazy" />}
                <span>
                  <b>{category}</b>
                  <small>
                    Explore picks <ArrowUpRight size={13} />
                  </small>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="market-product-panel">
        <div className="market-section-heading">
          <div>
            <span className="market-kicker">THE PICKORA CATALOG</span>
            <h2>Shop all products</h2>
          </div>
          <Link to="/products">
            Browse the catalog <ArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="skeleton" key={index} />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {picks.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
        {!loading && picks.length === 0 && (
          <p className="market-empty">
            Catalog is getting ready. Please check back soon.
          </p>
        )}
      </section>

      <section className="affiliate-note">
        <ExternalLink size={18} />
        <p>
          <b>Shop directly with our partner stores.</b> Pickora may earn a
          commission from qualifying purchases through affiliate links, at no
          extra cost to you.
        </p>
      </section>
    </main>
  );
}
