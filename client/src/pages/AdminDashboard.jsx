import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CircleHelp,
  LayoutDashboard,
  MousePointerClick,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import { Link, useRouter } from "../router/Router.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useProducts } from "../contexts/ProductsContext.jsx";
import { api, money } from "../lib/api.js";
import "./AdminDashboard.css";

const blankProduct = {
  name: "",
  category: "Home",
  price: "",
  originalPrice: "",
  merchant: "Amazon India",
  affiliateUrl: "",
  image: "",
  stock: "10",
  description: "",
  featured: false,
};
const blankAdmin = { name: "", email: "", password: "" };
const pages = [
  { id: "overview", label: "Overview", href: "/admin", icon: LayoutDashboard },
  { id: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  {
    id: "affiliate",
    label: "Affiliate clicks",
    href: "/admin/affiliate",
    icon: MousePointerClick,
  },
  { id: "products", label: "Products", href: "/admin/products", icon: Package },
  { id: "users", label: "Users & admins", href: "/admin/users", icon: Users },
  { id: "reviews", label: "Reviews", href: "/admin/reviews", icon: Star },
  {
    id: "help",
    label: "Help & support",
    href: "/admin/help",
    icon: CircleHelp,
  },
];

function Popup({ title, children, onClose, narrow = false }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`admin-modal ${narrow ? "admin-modal-narrow" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="admin-modal-heading">
          <h2 id="admin-modal-title">{title}</h2>
          <button
            type="button"
            className="admin-icon-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </section>
    </div>
  );
}

function Pager({ page, count, setPage }) {
  const total = Math.max(1, Math.ceil(count / 20));
  return (
    <div className="admin-pager">
      <span>
        {count} results{total > 1 ? ` · page ${page} of ${total}` : ""}
      </span>
      {total > 1 && (
        <div>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <button disabled={page >= total} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function SearchBox({ query, setQuery, placeholder }) {
  return (
    <div className="admin-list-tools">
      <label>
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />
      </label>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { refresh } = useProducts();
  const { pathname } = useRouter();
  const route = pathname.split(/[?#]/)[0];
  const section = pages.find((item) => item.href === route)?.id || "overview";
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [affiliateClicks, setAffiliateClicks] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [productForm, setProductForm] = useState(null);
  const [adminForm, setAdminForm] = useState(null);
  const [passwordForm, setPasswordForm] = useState(null);
  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function load(target = section) {
    setLoading(true);
    try {
      if (target === "overview") {
        const [p, o, c, u, r] = await Promise.all([
          api("/admin/products"),
          api("/admin/orders"),
          api("/admin/affiliate-clicks"),
          api("/users"),
          api("/admin/reviews"),
        ]);
        setProducts(p.products || []);
        setOrders(o.orders || []);
        setAffiliateClicks(c.clicks || []);
        setUsers(u.users || []);
        setReviews(r.reviews || []);
      } else if (target === "products")
        setProducts((await api("/admin/products")).products || []);
      else if (target === "orders")
        setOrders((await api("/admin/orders")).orders || []);
      else if (target === "affiliate")
        setAffiliateClicks((await api("/admin/affiliate-clicks")).clicks || []);
      else if (target === "users") setUsers((await api("/users")).users || []);
      else if (target === "reviews")
        setReviews((await api("/admin/reviews")).reviews || []);
    } catch (error) {
      setNotice({
        title: "Could not load this page",
        message: error.message,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    setQuery("");
    setPage(1);
    load(section);
  }, [section]);

  const allRows =
    section === "products"
      ? products
      : section === "orders"
        ? orders
        : section === "affiliate"
          ? affiliateClicks
          : section === "users"
            ? users
            : section === "reviews"
              ? reviews
              : [];
  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return allRows;
    return allRows.filter((item) => {
      const text =
        section === "products"
          ? `${item.name} ${item.category} ${item.merchant}`
          : section === "orders"
            ? `${item._id} ${item.user?.name} ${item.user?.email} ${item.status}`
            : section === "affiliate"
              ? `${item.productName} ${item.merchant} ${item.user?.name} ${item.user?.email}`
              : section === "users"
                ? `${item.name} ${item.email} ${item.role}`
                : `${item.user?.name} ${item.product?.name} ${item.comment}`;
      return text.toLowerCase().includes(term);
    });
  }, [section, allRows, query]);
  const visible = rows.slice((page - 1) * 20, page * 20);
  const notify = (title, message, error = false) =>
    setNotice({ title, message, error });

  async function saveProduct(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const { editId, ...data } = productForm;
      data.price = Number(data.price);
      data.stock = Number(data.stock);
      data.originalPrice = data.originalPrice
        ? Number(data.originalPrice)
        : undefined;
      await api(editId ? `/admin/products/${editId}` : "/admin/products", {
        method: editId ? "PATCH" : "POST",
        body: JSON.stringify(data),
      });
      setProductForm(null);
      await Promise.all([load("products"), refresh()]);
      notify(
        editId ? "Product updated" : "Product added",
        `${data.name} has been saved.`,
      );
    } catch (error) {
      notify("Product could not be saved", error.message, true);
    } finally {
      setBusy(false);
    }
  }
  async function visibility(product) {
    try {
      await api(`/admin/products/${product._id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      await load("products");
      notify(
        product.isActive ? "Product hidden" : "Product restored",
        product.name,
      );
    } catch (error) {
      notify("Product was not updated", error.message, true);
    }
  }
  function deleteProduct(product) {
    setConfirm({
      title: "Delete product permanently?",
      message: `“${product.name}” and its reviews will be deleted. This cannot be undone.`,
      action: async () => {
        await api(`/admin/products/${product._id}`, { method: "DELETE" });
        await Promise.all([load("products"), refresh()]);
        notify("Product deleted", product.name);
      },
    });
  }
  async function changeOrder(order, status) {
    try {
      await api(`/admin/orders/${order._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load("orders");
      notify(
        "Order status updated",
        `Order ${order._id.slice(-7)} is now ${status}.`,
      );
    } catch (error) {
      notify("Order was not updated", error.message, true);
      await load("orders");
    }
  }
  function changeUserStatus(account) {
    setConfirm({
      title: `${account.isActive ? "Disable" : "Enable"} this account?`,
      message: `${account.name} (${account.email}) will ${account.isActive ? "not be able to sign in" : "be able to sign in again"}.`,
      action: async () => {
        await api(`/users/${account._id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ isActive: !account.isActive }),
        });
        await load("users");
        notify("Account updated", account.name);
      },
    });
  }
  async function createAdmin(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api("/admin/users/admin", {
        method: "POST",
        body: JSON.stringify(adminForm),
      });
      setAdminForm(null);
      await load("users");
      notify("Admin account created", result.message || "New admin is ready.");
    } catch (error) {
      notify("Admin account was not created", error.message, true);
    } finally {
      setBusy(false);
    }
  }
  async function resetPassword(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const account = passwordForm.account;
      await api(`/admin/users/${account._id}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: passwordForm.password }),
      });
      setPasswordForm(null);
      notify(
        "Temporary password set",
        `Verify ${account.name}'s identity, then share it through a secure channel. Ask them to change it after signing in.`,
      );
    } catch (error) {
      notify("Password was not reset", error.message, true);
    } finally {
      setBusy(false);
    }
  }
  async function confirmAction() {
    const action = confirm?.action;
    setConfirm(null);
    try {
      await action?.();
    } catch (error) {
      notify("Action could not be completed", error.message, true);
    }
  }
  const editProduct = (product) =>
    setProductForm({
      ...product,
      price: String(product.price),
      stock: String(product.stock),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      editId: product._id,
    });

  return (
    <main className="dashboard-page admin-page">
      <div className="dashboard-heading admin-welcome">
        <div>
          <div className="eyebrow">PICKORA ADMIN CONTROL ROOM</div>
          <h1>
            {section === "overview" ? (
              <>
                Welcome back, <em>{user?.name?.split(" ")[0]}.</em>
              </>
            ) : (
              pages.find((item) => item.id === section)?.label
            )}
          </h1>
          <p>
            {section === "overview"
              ? "Select a workspace to manage Pickora. Each admin area has its own page."
              : "Manage this Pickora workspace from your admin account."}
          </p>
        </div>
        <button className="button outline" onClick={signOut}>
          Sign out
        </button>
      </div>
      <nav className="admin-nav" aria-label="Admin sections">
        {pages.map(({ id, label, href, icon: Icon }) => (
          <Link key={id} to={href} className={section === id ? "active" : ""}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <Link className="admin-landing-link" to="/">
          <ArrowLeft size={16} />
          Landing page
        </Link>
      </nav>

      {section === "overview" && (
        <>
          {loading && <p className="admin-loading">Loading dashboard…</p>}
          <div className="admin-metrics">
            <div>
              <Package />
              <b>{products.filter((x) => x.isActive).length}</b>
              <span>Live products</span>
            </div>
            <div>
              <ShoppingBag />
              <b>{orders.length}</b>
              <span>Orders</span>
            </div>
            <div>
              <MousePointerClick />
              <b>{affiliateClicks.length}</b>
              <span>Seller visits</span>
            </div>
            <div>
              <Users />
              <b>{users.length}</b>
              <span>Users</span>
            </div>
            <div>
              <Star />
              <b>{reviews.length}</b>
              <span>Reviews</span>
            </div>
          </div>
          <section className="admin-shortcuts">
            <h2>Admin workspaces</h2>
            <div>
              {pages.slice(1).map(({ id, label, href, icon: Icon }) => (
                <Link to={href} key={id}>
                  <Icon />
                  <span>
                    <b>{label}</b>
                    <small>
                      {id === "orders"
                        ? "Find orders and update their status"
                        : id === "affiliate"
                          ? "Review signed-in visits to partner sellers"
                          : id === "products"
                            ? "Add, edit, hide or remove products"
                            : id === "users"
                              ? "Manage accounts and create admins"
                              : id === "reviews"
                                ? "Read customer feedback"
                                : "Password recovery and support"}
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {section === "products" && (
        <section className="dashboard-panel admin-list-panel">
          <div className="panel-heading">
            <div>
              <h2>Product management</h2>
              <span>Add new picks or update product details.</span>
            </div>
            <button
              className="button dark"
              onClick={() => setProductForm({ ...blankProduct })}
            >
              <Plus size={17} /> Add product
            </button>
          </div>
          <SearchBox
            query={query}
            setQuery={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search products, categories or sellers"
          />
          <span className="admin-total">{products.length} total</span>
          {loading ? (
            <p className="admin-loading">Loading products…</p>
          ) : (
            <div className="admin-table">
              {visible.map((item) => (
                <div className="admin-table-row" key={item._id}>
                  <img src={item.image} alt="" />
                  <div className="table-primary">
                    <b>{item.name}</b>
                    <small>
                      {item.category} · {money(item.price)} · {item.stock} in
                      stock · {item.merchant}
                    </small>
                  </div>
                  <span
                    className={`status-chip ${item.isActive ? "active" : "cancelled"}`}
                  >
                    {item.isActive ? "Live" : "Hidden"}
                  </span>
                  <button
                    className="small-action"
                    onClick={() => editProduct(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="small-action"
                    onClick={() => visibility(item)}
                  >
                    {item.isActive ? "Hide" : "Restore"}
                  </button>
                  <button
                    className="small-action danger-action"
                    onClick={() => deleteProduct(item)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              ))}
              {!visible.length && (
                <p className="admin-empty">No products match this search.</p>
              )}
            </div>
          )}
          <Pager page={page} count={rows.length} setPage={setPage} />
        </section>
      )}

      {section === "orders" && (
        <section className="dashboard-panel admin-list-panel">
          <div className="panel-heading">
            <div>
              <h2>Orders</h2>
              <span>
                Review and update orders as they move through fulfillment.
              </span>
            </div>
          </div>
          <SearchBox
            query={query}
            setQuery={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search order, customer or status"
          />
          <span className="admin-total">{orders.length} total</span>
          {loading ? (
            <p className="admin-loading">Loading orders…</p>
          ) : (
            <div className="admin-table">
              {visible.map((item) => (
                <div className="admin-order-row" key={item._id}>
                  <div>
                    <b>Order #{item._id.slice(-8).toUpperCase()}</b>
                    <small>
                      {item.user?.name || "Customer"} · {item.user?.email || ""}{" "}
                      · {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                    <small>
                      {item.items
                        ?.map(
                          (product) => `${product.name} × ${product.quantity}`,
                        )
                        .join(" · ")}
                    </small>
                  </div>
                  <strong>{money(item.total)}</strong>
                  <label className="admin-order-status">
                    <span
                      className={`status-chip ${item.status === "cancelled" ? "cancelled" : "active"}`}
                    >
                      {item.status}
                    </span>
                    <select
                      value={item.status}
                      aria-label={`Update status for order ${item._id}`}
                      onChange={(event) =>
                        changeOrder(item, event.target.value)
                      }
                    >
                      {[
                        "placed",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
              {!visible.length && (
                <p className="admin-empty">No orders match this search.</p>
              )}
            </div>
          )}
          <Pager page={page} count={rows.length} setPage={setPage} />
        </section>
      )}

      {section === "affiliate" && (
        <section className="dashboard-panel admin-list-panel">
          <div className="panel-heading">
            <div>
              <h2>Affiliate seller visits</h2>
              <span>
                Recent signed-in Buy Now clicks recorded before customers visit
                a partner seller.
              </span>
            </div>
          </div>
          <div className="admin-affiliate-disclaimer">
            These are outbound link clicks, not confirmed purchases.
            Amazon/partner purchase confirmation requires an approved reporting
            integration.
          </div>
          <SearchBox
            query={query}
            setQuery={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search product, customer or seller"
          />
          <span className="admin-total">
            {affiliateClicks.length} recent visits shown (maximum 500)
          </span>
          {loading ? (
            <p className="admin-loading">Loading seller visits…</p>
          ) : (
            <div className="admin-table">
              {visible.map((click) => (
                <div className="admin-order-row" key={click._id}>
                  <div className="admin-affiliate-product">
                    {click.image && <img src={click.image} alt="" />}
                    <div>
                      <b>{click.productName}</b>
                      <small>
                        {click.merchant} ·{" "}
                        {new Date(click.createdAt).toLocaleString()}
                      </small>
                      <small>
                        {click.user?.name || "Customer"} ·{" "}
                        {click.user?.email || ""}
                      </small>
                    </div>
                  </div>
                  <span className="status-chip active">Click recorded</span>
                  <a
                    className="small-action"
                    href={click.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open seller link
                  </a>
                </div>
              ))}
              {!visible.length && (
                <p className="admin-empty">
                  No seller visits match this search.
                </p>
              )}
            </div>
          )}
          <Pager page={page} count={rows.length} setPage={setPage} />
        </section>
      )}

      {section === "users" && (
        <section className="dashboard-panel admin-list-panel">
          <div className="panel-heading">
            <div>
              <h2>Users & admins</h2>
              <span>Manage customer access and create trusted admins.</span>
            </div>
            <button
              className="button dark"
              onClick={() => setAdminForm(blankAdmin)}
            >
              <UserPlus size={17} /> New admin
            </button>
          </div>
          <SearchBox
            query={query}
            setQuery={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search name, email or role"
          />
          <span className="admin-total">{users.length} total</span>
          {loading ? (
            <p className="admin-loading">Loading users…</p>
          ) : (
            <div className="admin-table">
              {visible.map((item) => (
                <div className="admin-user-row" key={item._id}>
                  <div className="admin-user-avatar">
                    {item.name?.slice(0, 1)?.toUpperCase()}
                  </div>
                  <div className="table-primary">
                    <b>{item.name}</b>
                    <small>
                      {item.email} · {item.role} · Joined{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <span
                    className={`status-chip ${item.isActive ? "active" : "cancelled"}`}
                  >
                    {item.isActive ? "Active" : "Disabled"}
                  </span>
                  {item.role === "customer" && (
                    <div className="admin-user-actions">
                      <button
                        className="small-action"
                        onClick={() =>
                          setPasswordForm({ account: item, password: "" })
                        }
                      >
                        Reset password
                      </button>
                      <button
                        className="small-action"
                        onClick={() => changeUserStatus(item)}
                      >
                        {item.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!visible.length && (
                <p className="admin-empty">No accounts match this search.</p>
              )}
            </div>
          )}
          <Pager page={page} count={rows.length} setPage={setPage} />
        </section>
      )}

      {section === "reviews" && (
        <section className="dashboard-panel admin-list-panel">
          <div className="panel-heading">
            <div>
              <h2>Customer reviews</h2>
              <span>Browse feedback and ratings by product.</span>
            </div>
          </div>
          <SearchBox
            query={query}
            setQuery={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search review, customer or product"
          />
          <span className="admin-total">{reviews.length} total</span>
          {loading ? (
            <p className="admin-loading">Loading reviews…</p>
          ) : (
            <div className="admin-review-list">
              {visible.map((item) => (
                <article className="admin-review-card" key={item._id}>
                  <div className="admin-review-title">
                    <span>
                      <Star size={14} fill="currentColor" /> {item.rating}/5
                    </span>
                    <small>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <b>{item.product?.name || "Product"}</b>
                  <p>{item.comment}</p>
                  <small>
                    By {item.user?.name || "Customer"} ·{" "}
                    {item.user?.email || ""}
                  </small>
                </article>
              ))}
              {!visible.length && (
                <p className="admin-empty">No reviews match this search.</p>
              )}
            </div>
          )}
          <Pager page={page} count={rows.length} setPage={setPage} />
        </section>
      )}

      {section === "help" && (
        <section className="dashboard-panel admin-help-panel">
          <div className="admin-help-title">
            <CircleHelp size={25} />
            <div>
              <h2>Admin help & support</h2>
              <p>Quick, safe steps for common Pickora issues.</p>
            </div>
          </div>
          <div className="admin-help-grid">
            <article>
              <h3>Customer forgot their password</h3>
              <p>
                Open <b>Users & admins</b>, verify the customer, then choose{" "}
                <b>Reset password</b> and set a temporary password with 12+
                characters. Share it only through a secure channel; the customer
                can change it from Account → Account security after signing in.
                Never ask for their old password.
              </p>
              <p>
                Automatic reset emails are not set up. Add a trusted mail
                provider and reset-link flow to enable them.
              </p>
            </article>
            <article>
              <h3>Product or affiliate-link issue</h3>
              <p>
                Open <b>Products</b>, search for the item, and choose Edit to
                correct details or affiliate URL. Hide a product to temporarily
                remove it from browsing.
              </p>
            </article>
            <article>
              <h3>Order question</h3>
              <p>
                Open <b>Orders</b> and search by order ID or customer. Update
                status in the dropdown. Cancelled orders cannot be reopened, so
                confirm details first.
              </p>
            </article>
            <article>
              <h3>Affiliate seller visit</h3>
              <p>
                Open <b>Affiliate clicks</b> to see the signed-in customer,
                product and time when they opened a partner seller link. These
                visits are not proof that the customer completed a purchase;
                confirmed sales need reporting access from Amazon or the
                affiliate network.
              </p>
            </article>
            <article>
              <h3>Admin access</h3>
              <p>
                Create admins only for trusted teammates. Use a strong password
                and share it securely. Never include passwords, tokens, MongoDB
                URIs, or JWT secrets in support messages.
              </p>
            </article>
            <article>
              <h3>Something else is not working</h3>
              <p>
                Note which page, when it happened, and the exact error. Check
                that the API server and MongoDB are running, then contact the
                site owner. Do not send passwords or login tokens.
              </p>
            </article>
            <article>
              <h3>Return to Pickora</h3>
              <p>
                Choose <b>Landing page</b> in this admin navigation to open the
                customer-facing homepage.
              </p>
            </article>
          </div>
        </section>
      )}

      {productForm && (
        <Popup
          title={productForm.editId ? "Edit product" : "Add product"}
          onClose={() => !busy && setProductForm(null)}
        >
          <form
            id="product-form"
            className="admin-product-form"
            onSubmit={saveProduct}
          >
            <label>
              Product name
              <input
                required
                minLength="2"
                maxLength="120"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
              />
            </label>
            <div className="form-row">
              <label>
                Category
                <input
                  required
                  maxLength="40"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                />
              </label>
              <label>
                Price (₹)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                />
              </label>
              <label>
                Stock
                <input
                  required
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({ ...productForm, stock: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Original price (optional)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={productForm.originalPrice || ""}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    originalPrice: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Product image URL
              <input
                required
                type="url"
                value={productForm.image}
                onChange={(e) =>
                  setProductForm({ ...productForm, image: e.target.value })
                }
              />
            </label>
            <div className="form-row">
              <label>
                Seller / store
                <input
                  required
                  maxLength="80"
                  value={productForm.merchant || ""}
                  onChange={(e) =>
                    setProductForm({ ...productForm, merchant: e.target.value })
                  }
                />
              </label>
              <label>
                Affiliate Buy Now URL
                <input
                  required
                  type="url"
                  maxLength="1000"
                  value={productForm.affiliateUrl || ""}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      affiliateUrl: e.target.value,
                    })
                  }
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                required
                minLength="10"
                maxLength="1500"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={!!productForm.featured}
                onChange={(e) =>
                  setProductForm({ ...productForm, featured: e.target.checked })
                }
              />{" "}
              Show in featured picks
            </label>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="button outline"
                onClick={() => setProductForm(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button type="submit" className="button dark" disabled={busy}>
                {busy
                  ? "Saving…"
                  : productForm.editId
                    ? "Save changes"
                    : "Add product"}
              </button>
            </div>
          </form>
        </Popup>
      )}

      {adminForm && (
        <Popup
          title="Create a new admin"
          narrow
          onClose={() => !busy && setAdminForm(null)}
        >
          <form
            id="admin-form"
            className="admin-product-form"
            onSubmit={createAdmin}
          >
            <label>
              Full name
              <input
                required
                minLength="2"
                maxLength="80"
                value={adminForm.name}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, name: e.target.value })
                }
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                maxLength="160"
                autoComplete="off"
                value={adminForm.email}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, email: e.target.value })
                }
              />
            </label>
            <label>
              Password
              <input
                required
                type="password"
                minLength="12"
                maxLength="72"
                autoComplete="new-password"
                value={adminForm.password}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, password: e.target.value })
                }
              />
              <small>Use at least 12 characters.</small>
            </label>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="button outline"
                onClick={() => setAdminForm(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button dark" disabled={busy}>
                {busy ? "Creating…" : "Create admin"}
              </button>
            </div>
          </form>
        </Popup>
      )}

      {passwordForm && (
        <Popup
          title={`Reset password for ${passwordForm.account.name}`}
          narrow
          onClose={() => !busy && setPasswordForm(null)}
        >
          <form
            id="reset-password-form"
            className="admin-product-form"
            onSubmit={resetPassword}
          >
            <label>
              Temporary password
              <input
                type="password"
                required
                minLength="12"
                maxLength="72"
                autoComplete="new-password"
                value={passwordForm.password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, password: e.target.value })
                }
              />
              <small>
                At least 12 characters. Share only after verifying the customer.
              </small>
            </label>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="button outline"
                onClick={() => setPasswordForm(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button type="submit" className="button dark" disabled={busy}>
                {busy ? "Updating…" : "Set temporary password"}
              </button>
            </div>
          </form>
        </Popup>
      )}

      {confirm && (
        <Popup title={confirm.title} narrow onClose={() => setConfirm(null)}>
          <p className="admin-confirm-copy">{confirm.message}</p>
          <div className="admin-modal-actions">
            <button className="button outline" onClick={() => setConfirm(null)}>
              Go back
            </button>
            <button className="button dark" onClick={confirmAction}>
              Confirm
            </button>
          </div>
        </Popup>
      )}
      {notice && (
        <Popup title={notice.title} narrow onClose={() => setNotice(null)}>
          <p
            className={`admin-feedback-copy ${notice.error ? "error" : "success"}`}
          >
            {notice.message}
          </p>
          <div className="admin-modal-actions">
            <button
              autoFocus
              className="button dark"
              onClick={() => setNotice(null)}
            >
              Okay
            </button>
          </div>
        </Popup>
      )}
    </main>
  );
}
