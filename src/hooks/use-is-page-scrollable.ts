"use client";

import { useEffect, useState } from "react";

export function useIsPageScrollable() {
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    function check() {
      setIsScrollable(
        document.documentElement.scrollHeight > window.innerHeight
      );
    }

    check();

    const resizeObserver = new ResizeObserver(check);
    resizeObserver.observe(document.documentElement);
    window.addEventListener("resize", check);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);

  return isScrollable;
}
