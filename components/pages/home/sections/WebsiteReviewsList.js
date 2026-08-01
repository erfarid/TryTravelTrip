"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { ReviewsCard } from "../ui/ReviewsCard";

const customerReviews = [
  {
    id: "review-david",
    reviewer: "David",
    rate: 5,
    comment:
      "The booking process was quick and very easy. I found one of the cheapest flight offers compared with other travel websites.",
  },
  {
    id: "review-sachin",
    reviewer: "Sachin",
    rate: 5,
    comment:
      "I had a great experience using TryTravelTrip. The website is simple, well organised and helped me find a very good travel offer.",
  },
  {
    id: "review-victor",
    reviewer: "Victor",
    rate: 5,
    comment:
      "Customer support was very fast and helpful. They answered my questions clearly and helped me complete my booking without any difficulty.",
  },
  {
    id: "review-sagar",
    reviewer: "Sagar",
    rate: 5,
    comment:
      "The flight-search experience was smooth and easy to understand. I found affordable options and completed my booking quickly.",
  },
  {
    id: "review-nick",
    reviewer: "Nick",
    rate: 4,
    comment:
      "A clean and reliable travel website with good offers. The booking information was properly displayed and easy to compare.",
  },
  {
    id: "review-alex",
    reviewer: "Alex",
    rate: 5,
    comment:
      "I found the cheapest available option for my trip. The website saved me time and the entire booking experience was excellent.",
  },
  {
    id: "review-emma",
    reviewer: "Emma",
    rate: 5,
    comment:
      "The website is easy to use and the support team responds very quickly. I would recommend TryTravelTrip for finding good travel deals.",
  },
];

export function WebsiteReviewsList() {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 768 ? -300 : -400;

      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 300 : 400;

      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {/* Left navigation button */}
      <button
        type="button"
        onClick={scrollLeft}
        aria-label="View previous reviews"
        className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#2563eb] bg-[#dbeafe] shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-2xl focus:outline-none"
      >
        <ChevronLeft className="h-6 w-6 text-[#1d4ed8]" />
      </button>

      {/* Right navigation button */}
      <button
        type="button"
        onClick={scrollRight}
        aria-label="View more reviews"
        className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#2563eb] bg-[#dbeafe] shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-2xl focus:outline-none"
      >
        <ChevronRight className="h-6 w-6 text-[#1d4ed8]" />
      </button>

      {/* Reviews container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex items-stretch gap-8 overflow-x-auto px-14 py-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {customerReviews.map((review) => {
          const { id, comment, rate, reviewer } = review;

          return (
            <div
              key={id}
              className="flex min-w-[290px] max-w-[380px] flex-shrink-0 sm:min-w-[340px]"
            >
              <ReviewsCard
                comment={comment}
                rate={rate}
                reviewer={reviewer}
                profileImage={null}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
