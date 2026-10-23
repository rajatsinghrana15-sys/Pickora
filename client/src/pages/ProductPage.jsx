import React, { useEffect, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Link, useRouter } from "../router/Router.jsx";
import { useProducts } from "../contexts/ProductsContext.jsx";
import { api, money } from "../lib/api.js";
import AffiliateBuyButton from "../components/AffiliateBuyButton.jsx";
import "./ProductPage.css";

export default function ProductPage() {
  const { pathname, navigate } = useRouter();
  const { products, loading, refresh } = useProducts();
  const id = decodeURIComponent(pathname.split("/").pop() || "");
  const product = products.find((item) => item._id === id);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  async function loadReviews() {
    if (!id.startsWith("demo-")) {
      const result = await api(`/products/${id}/reviews`);
      setReviews(result.reviews);
    }
  }
  useEffect(() => {
    loadReviews().catch(() => {});
  }, [id]);

  async function submitReview(event) {
    event.preventDefault();
    setReviewError("");
    setReviewMessage("");
    setReviewBusy(true);
    try {
      await api(`/products/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating: Number(rating), comment }),
      });
      setComment("");
      setReviewMessage("Thanks! Your review has been saved.");
      await Promise.all([loadReviews(), refresh()]);
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setReviewBusy(false);
    }
  }

  if (loading) return <div className="page-loading">Loading product…</div>;
  if (!product)
    return (
      <main className="dashboard-page">
        <h1>We couldn't find that item.</h1>
        <Link className="button dark" to="/products">
          Back to the shop
        </Link>
      </main>
    );

  return (
    <main className="product-page">
      <button className="back-link" onClick={() => navigate("/products")}>
        <ArrowLeft size={15} /> Back to the shop
      </button>
      <div className="product-detail-grid">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <section className="detail-copy">
          <div className="eyebrow">
            {product.category.toUpperCase()} · PICKORA FINDS
          </div>
          <h1>{product.name}</h1>
          <div className="detail-rating">
            <Star size={15} fill="currentColor" />{" "}
            {Number(product.rating || 4.7).toFixed(1)} · Thoughtfully selected
          </div>
          <strong className="detail-price">{money(product.price)}</strong>
          <p>{product.description}</p>
          {product.originalPrice > product.price && (
            <p className="stock-note">
              Was {money(product.originalPrice)} · Save{" "}
              {money(product.originalPrice - product.price)}
            </p>
          )}
          <AffiliateBuyButton product={product}>
            Buy Now at {product.merchant || "partner store"}
          </AffiliateBuyButton>
          <div className="detail-delivery">
            You’ll complete your purchase on the seller’s website. Price and
            availability can change there.
          </div>
        </section>
      </div>
      <section className="product-reviews">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">CUSTOMER NOTES</div>
            <h2>Reviews</h2>
          </div>
          <span>{reviews.length} reviews</span>
        </div>
        {reviewError && (
          <div className="form-error" role="alert">
            {reviewError}
          </div>
        )}
        {reviewMessage && (
          <div className="form-success" role="status">
            {reviewMessage}
          </div>
        )}
        {id.startsWith("demo-") ? (
          <p className="muted">
            Reviews are available when the API and database are connected.
          </p>
        ) : (
          <>
            <form className="review-form" onSubmit={submitReview}>
              <label>
                Your rating
                <select
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="review-comment">
                Your review
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  required
                  minLength="5"
                  maxLength="1000"
                  placeholder="Share what you liked about this product"
                />
              </label>
              <button className="button dark" disabled={reviewBusy}>
                {reviewBusy ? "Saving…" : "Submit review"}
              </button>
              <small>
                Reviews can be submitted after an order is delivered.
              </small>
            </form>
            <div className="review-list">
              {reviews.map((review) => (
                <article className="review-card" key={review._id}>
                  <div className="review-card-top">
                    <b>{review.user?.name || "Pickora member"}</b>
                    <span>
                      <Star size={13} fill="currentColor" /> {review.rating}/5
                    </span>
                  </div>
                  <p>{review.comment}</p>
                  <small>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </small>
                </article>
              ))}
              {!reviews.length && <p className="muted">No reviews yet.</p>}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
