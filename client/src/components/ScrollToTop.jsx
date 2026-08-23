import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the window to the top
    window.scrollTo(0, 0);

    // Also scroll any scrollable containers (like .buyer-dashboard)
    const scrollableContainers = document.querySelectorAll(
      '.buyer-dashboard, .dashboard-content, .dashboard-content-seller'
    );
    scrollableContainers.forEach((el) => {
      el.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
