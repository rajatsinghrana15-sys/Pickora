import React, { useState } from "react";
import { Menu, Search, UserRound } from "lucide-react";
import { Link } from "../router/Router.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useRouter } from "../router/Router.jsx";
import "./SiteHeader.css";

const navLinks = [
  { label: "All Products", to: "/products" },
  { label: "Home", to: "/#home" },
  { label: "Categories", to: "/#categories" },
  { label: "Products", to: "/#products" },
];

export default function SiteHeader({ onSearch }) {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dashboard = user?.role === "admin" ? "/admin" : "/account";
  function search(value) {
    setQuery(value);
    onSearch?.(value);
  }
  function submitSearch(event) {
    event.preventDefault();
    onSearch?.(query);
    navigate("/products");
  }
  return (
    <>
      <div className="announcement">
        Pickora may earn a commission when you shop through our links.
      </div>
      <header className="header market-header">
        <div className="market-main">
          <button
            className="icon-button market-menu"
            aria-label="Toggle categories"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu />
          </button>
          <Link className="brand market-brand" to="/">
            Pick<span>ora</span>
            <i>.</i>
          </Link>
          <form className="market-search" onSubmit={submitSearch}>
            <span className="search-category">All</span>
            <input
              aria-label="Search products"
              placeholder="Search Pickora products"
              value={query}
              onChange={(e) => search(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <Search size={20} />
            </button>
          </form>
          <Link className="market-account" to={user ? dashboard : "/login"}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" />
            ) : (
              <UserRound size={19} />
            )}
            <span>
              <small>
                {user ? `Hello, ${user.name.split(" ")[0]}` : "Welcome"}
              </small>
              <strong>
                {user?.role === "admin"
                  ? "Admin tools"
                  : user
                    ? "Your account"
                    : "Sign in"}
              </strong>
            </span>
          </Link>
        </div>
        <nav
          className={menuOpen ? "nav market-nav open" : "nav market-nav"}
          aria-label="Shop categories"
        >
          {categories.map((label, i) => (
            <Link
              key={label}
              preserveScroll
              to={
                i === 0
                  ? "/products"
                  : `/products?category=${encodeURIComponent(label)}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <span className="nav-disclosure">
            Curated picks · Buy directly from partner stores
          </span>
        </nav>
      </header>
    </>
  );
}
