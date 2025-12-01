import React, { Suspense, useRef, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/partials/header";
import Sidebar from "@/components/partials/sidebar";
import useWidth from "@/hooks/useWidth";
import useSidebar from "@/hooks/useSidebar";
import useContentWidth from "@/hooks/useContentWidth";
import useMenulayout from "@/hooks/useMenulayout";
import useMenuHidden from "@/hooks/useMenuHidden";
import Footer from "@/components/partials/footer";
import MobileMenu from "../components/partials/sidebar/MobileMenu";
import useMobileMenu from "@/hooks/useMobileMenu";
import { ToastContainer } from "react-toastify";
import Loading from "@/components/Loading";
import { motion } from "framer-motion";

const Layout = () => {
  const { width, breakpoints } = useWidth();
  const [collapsed] = useSidebar();
  // content width
  const [contentWidth] = useContentWidth();
  const [menuType] = useMenulayout();
  const [menuHidden] = useMenuHidden();
  // mobile menu
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const nodeRef = useRef(null);
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Only animate when pathname actually changes (not on initial load)
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      setShouldAnimate(true);
      prevPathnameRef.current = location.pathname;
    } else {
      // On initial load, don't animate
      setShouldAnimate(false);
    }
  }, [location.pathname]);

  const switchHeaderClass = () => {
    if (menuType === "horizontal" || menuHidden) {
      return "ltr:ml-0 rtl:mr-0";
    } else if (collapsed) {
      return "ltr:ml-[72px] rtl:mr-[72px]";
    } else {
      return "ltr:ml-[280px] rtl:mr-[280px]";
    }
  };

  return (
    <>
      <ToastContainer />
      <Header className={width > breakpoints.xl ? switchHeaderClass() : ""} />
      {menuType === "vertical" && width > breakpoints.xl && !menuHidden && (
        <Sidebar />
      )}

      <MobileMenu
        className={`${
          width < breakpoints.xl && mobileMenu
            ? "left-0 visible opacity-100  z-[9999]"
            : "left-[-300px] invisible opacity-0  z-[-999] "
        }`}
      />
      {/* mobile menu overlay*/}
      {width < breakpoints.xl && mobileMenu && (
        <div
          className="overlay bg-gray-900/50 backdrop-filter backdrop-blur-sm opacity-100 fixed inset-0 z-[999]"
          onClick={() => setMobileMenu(false)}
        ></div>
      )}

      <div
        className={`content-wrapper transition-all duration-150 ${
          width > 1280 ? switchHeaderClass() : ""
        }`}
      >
        {/* md:min-h-screen will h-full*/}
        <div className="page-content   page-min-height  ">
          <div
            className={
              contentWidth === "boxed" ? "container mx-auto" : "container-fluid"
            }
          >
            <Suspense fallback={<Loading />}>
              {shouldAnimate ? (
                <motion.div
                  key={location.pathname}
                  initial="pageInitial"
                  animate="pageAnimate"
                  exit="pageExit"
                  variants={{
                    pageInitial: {
                      opacity: 0,
                      y: 10,
                    },
                    pageAnimate: {
                      opacity: 1,
                      y: 0,
                    },
                    pageExit: {
                      opacity: 0,
                      y: -10,
                    },
                  }}
                  transition={{
                    type: "tween",
                    ease: "easeInOut",
                    duration: 0.15,
                  }}
                >
                  <Outlet />
                </motion.div>
              ) : (
                <div key={location.pathname}>
                  <Outlet />
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>

      <Footer className={width > breakpoints.xl ? switchHeaderClass() : ""} />
    </>
  );
};

export default Layout;
