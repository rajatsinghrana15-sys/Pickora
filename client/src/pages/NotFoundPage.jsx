import React from "react";
import { Link } from "../router/Router.jsx";
import "./NotFoundPage.css";
export default function NotFoundPage() {
  return (
    <main className="dashboard-page not-found">
      <div className="eyebrow">A LITTLE DETOUR</div>
      <h1>
        We couldn't find that <em>page.</em>
      </h1>
      <p>Let's get you back to the good things.</p>
      <Link className="button dark" to="/">
        Back to the shop
      </Link>
    </main>
  );
}
