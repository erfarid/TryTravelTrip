"use client";

import { useEffect, useRef } from "react";

const WIDGET_URL =
  "https://tpwdgt.com/content?currency=eur&trs=546492&shmarker=687738&locale=en&stops=any&show_hotels=true&powered_by=true&border_radius=12&plain=true&color_button=%232563eb&color_button_text=%23ffffff&promo_id=3414&campaign_id=111";

export function KiwiFlightSearchWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    container.replaceChildren();

    const script = document.createElement("script");

    script.src = WIDGET_URL;
    script.async = true;
    script.charset = "utf-8";

    // Helpful when the production domain uses Cloudflare.
    script.setAttribute("data-cfasync", "true");

    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
  }, []);

  return (
    <div className="w-full overflow-visible rounded-2xl bg-white p-4 shadow-xl md:p-6">
      <div
        ref={containerRef}
        className="min-h-[180px] w-full"
        aria-label="Flight search"
      />
    </div>
  );
}
