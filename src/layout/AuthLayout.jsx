import React, { useEffect, Suspense } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/Loading";
import LoadingIcon from "@/components/LoadingIcon";

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingIcon />
      </div>
    );
  }

  // If user is already logged in, redirect to dashboard
  // This prevents authenticated users from accessing login page
  if (isLoggedIn) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-page-height">
        <Suspense fallback={<Loading />}>
          <ToastContainer />
          {<Outlet />}
        </Suspense>
      </div>
    </div>
  );
};

export default AuthLayout;
