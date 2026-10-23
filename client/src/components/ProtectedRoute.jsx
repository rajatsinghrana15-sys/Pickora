import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useRouter } from "../router/Router.jsx";
import "./ProtectedRoute.css";
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();
  useEffect(() => {
    if (!loading && !user) navigate("/login");
    else if (!loading && role && user && user.role !== role)
      navigate(user.role === "admin" ? "/admin" : "/account");
  }, [loading, user, role]);
  if (loading || !user || (role && user.role !== role))
    return (
      <div className="page-loading protected-route-loading">
        <span className="spinner" /> Checking your account…
      </div>
    );
  return children;
}
