import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { AppSplashLoader } from "../common/AppSplashLoader";

export function ProtectedRoute({ children, requiredModule = null }) {
  const { isAuthenticated, loading, canAccess, role, currentUser } = useAuth();
  const location = useLocation();

  // 1. Session determination loading state (renders official enterprise splash loader)
  if (loading) {
    return <AppSplashLoader duration={800} />;
  }

  // 2. Unauthenticated -> Redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but unauthorized for the specific module -> Render Access Denied
  if (requiredModule && !canAccess(requiredModule)) {
    return (
      <div className="card-enterprise p-8 text-center max-w-lg mx-auto mt-12 space-y-4 border-red-200 bg-red-50/20 shadow-sm rounded-2xl">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">ACCESS DENIED</h2>
          <p className="text-xs text-slate-700 font-medium max-w-md mx-auto leading-relaxed">
            You do not have permission to access this module.
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            Active Role: <strong className="text-slate-800">{role.replace(/_/g, " ")}</strong> • Module: <strong className="text-slate-800">{requiredModule}</strong>
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="btn-primary text-xs font-bold py-2.5 px-4 inline-flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Permitted Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
