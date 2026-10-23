import React from "react";
import { Link } from "../router/Router.jsx";
import "./SiteFooter.css";
export default function SiteFooter() {
  return (
    <footer>
      <Link className="brand" to="/">
        Pick<span>ora</span>
        <i>.</i>
      </Link>
      <p>Thoughtful finds, easy shopping.</p>
      <div className="footer-links">
        <Link to="/products">Shop</Link>
        <Link to="/#story">Our story</Link>
        <Link to="/account">My account</Link>
      </div>
      <small>© 2026 Pickora · Thoughtful finds, easy shopping</small>
    </footer>
  );
}
