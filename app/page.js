import { Nav } from "@/components/sections/Nav";

import { SearchFlightsAndStaysFormShortcut } from "@/components/pages/home/sections/SearchFlightsAndStaysFormShortcut";

import { FindFlightAndHotelcards } from "@/components/pages/home/sections/FindFlightAndHotelCards";

import { Reviews } from "@/components/pages/home/sections/Reviews";

import { Footer } from "@/components/sections/Footer";

import { auth } from "@/lib/auth";

import { FlightDestinations } from "@/components/pages/flights/sections/FlightDestinations";

import { PopularHotelDestinations } from "@/components/pages/hotels/sections/PopularHotelDestinations";

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <header className="relative mb-20 md:mb-24">
        <Nav
          type="home"
          className="absolute left-0 top-0 z-30"
          session={session}
        />

        <section className="relative flex h-[450px] w-full items-center bg-[#05253f] px-4 pt-16">
          <div className="w-full pb-28 text-center text-white md:pb-24">
            <h2 className="text-2xl font-bold leading-tight md:text-[2rem] lg:text-[2.5rem]">
              Helping Others
            </h2>

            <h1 className="mt-2 text-[2.5rem] font-bold uppercase leading-none md:text-[3.5rem] md:tracking-[.12em] lg:text-[4.5rem]">
              Live &amp; Travel
            </h1>

            <p className="mt-4 text-[1rem] font-semibold lg:text-[1.2rem]">
              Special offers to suit your plan
            </p>
          </div>
        </section>

        <SearchFlightsAndStaysFormShortcut className="relative left-1/2 z-20 w-[96%] max-w-[1450px] -translate-x-1/2 -translate-y-[30%] sm:w-[94%] md:-translate-y-[32%] xl:w-[92%]" />
      </header>

      <main className="mx-auto mb-10 w-[90%] space-y-10 md:mb-20 md:space-y-20">
        <FlightDestinations />

        <PopularHotelDestinations />

        <FindFlightAndHotelcards />

        <Reviews />
      </main>

      <Footer />
    </>
  );
}
