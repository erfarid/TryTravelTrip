"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ErrorMessage } from "../local-ui/errorMessage";
import { cn } from "@/lib/utils";

import swap from "@/public/icons/swap.svg";

const TRAVELPAYOUTS_MARKER = "687738.trytraveltrip";

const AIRPORTS = [
  { iataCode: "BUD", city: "Budapest", name: "Budapest Ferenc Liszt International Airport" },
  { iataCode: "DEL", city: "New Delhi", name: "Indira Gandhi International Airport" },
  { iataCode: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport" },
  { iataCode: "BLR", city: "Bengaluru", name: "Kempegowda International Airport" },
  { iataCode: "MAA", city: "Chennai", name: "Chennai International Airport" },
  { iataCode: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International Airport" },
  { iataCode: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose International Airport" },
  { iataCode: "CDG", city: "Paris", name: "Charles de Gaulle Airport" },
  { iataCode: "ORY", city: "Paris", name: "Paris Orly Airport" },
  { iataCode: "LHR", city: "London", name: "Heathrow Airport" },
  { iataCode: "LGW", city: "London", name: "Gatwick Airport" },
  { iataCode: "BER", city: "Berlin", name: "Berlin Brandenburg Airport" },
  { iataCode: "FRA", city: "Frankfurt", name: "Frankfurt Airport" },
  { iataCode: "MUC", city: "Munich", name: "Munich Airport" },
  { iataCode: "HAM", city: "Hamburg", name: "Hamburg Airport" },
  { iataCode: "VIE", city: "Vienna", name: "Vienna International Airport" },
  { iataCode: "PRG", city: "Prague", name: "Václav Havel Airport Prague" },
  { iataCode: "WAW", city: "Warsaw", name: "Warsaw Chopin Airport" },
  { iataCode: "FCO", city: "Rome", name: "Leonardo da Vinci–Fiumicino Airport" },
  { iataCode: "MXP", city: "Milan", name: "Milan Malpensa Airport" },
  { iataCode: "MAD", city: "Madrid", name: "Adolfo Suárez Madrid–Barajas Airport" },
  { iataCode: "BCN", city: "Barcelona", name: "Barcelona–El Prat Airport" },
  { iataCode: "AMS", city: "Amsterdam", name: "Amsterdam Airport Schiphol" },
  { iataCode: "BRU", city: "Brussels", name: "Brussels Airport" },
  { iataCode: "ZRH", city: "Zurich", name: "Zurich Airport" },
  { iataCode: "IST", city: "Istanbul", name: "Istanbul Airport" },
  { iataCode: "DXB", city: "Dubai", name: "Dubai International Airport" },
  { iataCode: "DOH", city: "Doha", name: "Hamad International Airport" },
  { iataCode: "AUH", city: "Abu Dhabi", name: "Zayed International Airport" },
  { iataCode: "JFK", city: "New York", name: "John F. Kennedy International Airport" },
  { iataCode: "EWR", city: "New York", name: "Newark Liberty International Airport" },
  { iataCode: "LAX", city: "Los Angeles", name: "Los Angeles International Airport" },
  { iataCode: "SFO", city: "San Francisco", name: "San Francisco International Airport" },
  { iataCode: "ORD", city: "Chicago", name: "O'Hare International Airport" },
  { iataCode: "YYZ", city: "Toronto", name: "Toronto Pearson International Airport" },
  { iataCode: "YVR", city: "Vancouver", name: "Vancouver International Airport" },
  { iataCode: "SIN", city: "Singapore", name: "Singapore Changi Airport" },
  { iataCode: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport" },
  { iataCode: "KUL", city: "Kuala Lumpur", name: "Kuala Lumpur International Airport" },
  { iataCode: "HKG", city: "Hong Kong", name: "Hong Kong International Airport" },
  { iataCode: "NRT", city: "Tokyo", name: "Narita International Airport" },
  { iataCode: "HND", city: "Tokyo", name: "Haneda Airport" },
  { iataCode: "ICN", city: "Seoul", name: "Incheon International Airport" },
  { iataCode: "SYD", city: "Sydney", name: "Sydney Airport" },
  { iataCode: "MEL", city: "Melbourne", name: "Melbourne Airport" },
];

function normalizeAirportInput(value) {
  const text = String(value || "").trim();

  const bracketCode = text.match(/\(([A-Za-z]{3})\)\s*$/);
  if (bracketCode) return bracketCode[1].toUpperCase();

  if (/^[A-Za-z]{3}$/.test(text)) return text.toUpperCase();

  const match = AIRPORTS.find(
    (airport) =>
      airport.city.toLowerCase() === text.toLowerCase() ||
      airport.name.toLowerCase() === text.toLowerCase(),
  );

  return match?.iataCode || "";
}

function buildKiwiSearchUrl({
  from,
  to,
  departureDate,
  returnDate,
}) {
  const kiwiUrl = new URL("https://www.kiwi.com/deep");

  kiwiUrl.searchParams.set("from", from);
  kiwiUrl.searchParams.set("to", to);
  kiwiUrl.searchParams.set("departure", departureDate);

  if (returnDate) {
    kiwiUrl.searchParams.set("return", returnDate);
  }

  return kiwiUrl.toString();
}

function buildKiwiAffiliateUrl(searchUrl) {
  const affiliateUrl = new URL("https://c111.travelpayouts.com/click");

  affiliateUrl.searchParams.set("shmarker", TRAVELPAYOUTS_MARKER);
  affiliateUrl.searchParams.set("promo_id", "3791");
  affiliateUrl.searchParams.set("source_type", "customlink");
  affiliateUrl.searchParams.set("type", "click");
  affiliateUrl.searchParams.set("custom_url", searchUrl);

  return affiliateUrl.toString();
}

function SearchFlightsForm() {
  const today = new Date().toISOString().split("T")[0];

  const [tripType, setTripType] = useState("one_way");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("economy");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSwap() {
    setFromInput(toInput);
    setToInput(fromInput);
  }

  function handleTripType(value) {
    setTripType(value);

    if (value === "one_way") {
      setReturnDate("");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const fromCode = normalizeAirportInput(fromInput);
    const toCode = normalizeAirportInput(toInput);
    const nextErrors = {};

    if (!fromCode) {
      nextErrors.from =
        "Choose an airport suggestion or enter a valid 3-letter IATA code.";
    }

    if (!toCode) {
      nextErrors.to =
        "Choose an airport suggestion or enter a valid 3-letter IATA code.";
    }

    if (fromCode && toCode && fromCode === toCode) {
      nextErrors.to = "Departure and destination airports must be different.";
    }

    if (!departureDate) {
      nextErrors.departureDate = "Please select a departure date.";
    }

    if (tripType === "round_trip" && !returnDate) {
      nextErrors.returnDate = "Please select a return date.";
    }

    if (
      tripType === "round_trip" &&
      departureDate &&
      returnDate &&
      returnDate < departureDate
    ) {
      nextErrors.returnDate =
        "The return date must be after the departure date.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const kiwiSearchUrl = buildKiwiSearchUrl({
      from: fromCode,
      to: toCode,
      departureDate,
      returnDate: tripType === "round_trip" ? returnDate : "",
    });

    const affiliateUrl = buildKiwiAffiliateUrl(kiwiSearchUrl);

    window.location.assign(affiliateUrl);
  }

  return (
    <form
      id="flightform"
      onSubmit={handleSubmit}
      className="text-black"
    >
      <div className="my-2 grid grid-cols-4 gap-1 xl:grid-cols-5">
        <div className="col-span-full">
          {Object.keys(errors).length > 0 && (
            <ErrorMessage
              message={
                <ol>
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>
                      <span className="font-bold">{field}</span>: {message}
                    </li>
                  ))}
                </ol>
              }
              className="text-xs"
            />
          )}
        </div>

        <div className="col-span-full mb-2 ml-2 flex flex-col gap-2">
          <span className="font-bold text-black">Trip Type</span>

          <RadioGroup
            value={tripType}
            onValueChange={handleTripType}
            className="flex flex-wrap gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="one_way" id="one_way" />
              <Label htmlFor="one_way">One Way</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="round_trip" id="round_trip" />
              <Label htmlFor="round_trip">Round Trip</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multi_city" id="multi_city" disabled />
              <Label
                className="cursor-not-allowed text-disabled"
                htmlFor="multi_city"
              >
                Multi City
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div
          className={cn(
            "relative col-span-full flex h-auto flex-col rounded-[8px] border-2 border-primary md:flex-row lg:col-span-2",
            (errors.from || errors.to) && "border-destructive",
          )}
        >
          <InputLabel
            label={
              <>
                From <span className="text-red-600">*</span> - to{" "}
                <span className="text-red-600">*</span>
              </>
            }
          />

          <div className="relative min-h-[86px] grow md:w-1/2 md:border-r-2 md:border-primary">
            <input
              list="from-airports"
              value={fromInput}
              onChange={(event) => setFromInput(event.target.value)}
              placeholder="City or IATA code"
              autoComplete="off"
              className="h-full min-h-[86px] w-full bg-transparent px-4 pb-5 pt-5 text-xl font-bold text-black outline-none"
            />

            <datalist id="from-airports">
              {AIRPORTS.map((airport) => (
                <option
                  key={`from-${airport.iataCode}`}
                  value={`${airport.city} (${airport.iataCode})`}
                >
                  {airport.name}
                </option>
              ))}
            </datalist>

            <span className="pointer-events-none absolute bottom-2 left-4 text-sm font-medium text-gray-600">
              Airport / IATA code
            </span>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap airports"
            className="absolute left-1/2 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary p-2 transition-all hover:border-2 hover:border-primary hover:bg-secondary-foreground"
          >
            <Image
              alt=""
              className="min-h-[16px] min-w-[16px] max-md:rotate-90"
              width={18}
              height={22}
              src={swap}
            />
          </button>

          <div className="relative min-h-[86px] grow md:w-1/2 md:border-l-2 md:border-primary">
            <input
              list="to-airports"
              value={toInput}
              onChange={(event) => setToInput(event.target.value)}
              placeholder="City or IATA code"
              autoComplete="off"
              className="h-full min-h-[86px] w-full bg-transparent px-4 pb-5 pt-5 text-xl font-bold text-black outline-none"
            />

            <datalist id="to-airports">
              {AIRPORTS.map((airport) => (
                <option
                  key={`to-${airport.iataCode}`}
                  value={`${airport.city} (${airport.iataCode})`}
                >
                  {airport.name}
                </option>
              ))}
            </datalist>

            <span className="pointer-events-none absolute bottom-2 left-4 text-sm font-medium text-gray-600">
              Airport / IATA code
            </span>
          </div>
        </div>

        <div
          className={cn(
            "relative col-span-full flex h-auto flex-col rounded-[8px] border-2 border-primary md:flex-row lg:col-span-2",
            (errors.departureDate || errors.returnDate) &&
              "border-destructive",
          )}
        >
          <InputLabel
            label={
              <>
                Depart <span className="text-red-600">*</span> - Return{" "}
                {tripType === "round_trip" && (
                  <span className="text-red-600">*</span>
                )}
              </>
            }
          />

          <div className="min-h-[86px] grow p-4 md:w-1/2 md:border-r-2 md:border-primary">
            <Label
              htmlFor="departure-date"
              className="mb-2 block text-sm font-medium"
            >
              Departure date
            </Label>

            <input
              id="departure-date"
              type="date"
              min={today}
              value={departureDate}
              onChange={(event) => {
                setDepartureDate(event.target.value);

                if (
                  returnDate &&
                  event.target.value &&
                  returnDate < event.target.value
                ) {
                  setReturnDate("");
                }
              }}
              className="w-full bg-transparent text-lg font-bold text-black outline-none"
            />
          </div>

          <div className="min-h-[86px] grow p-4 md:w-1/2 md:border-l-2 md:border-primary">
            <Label
              htmlFor="return-date"
              className="mb-2 block text-sm font-medium"
            >
              Return date
            </Label>

            <input
              id="return-date"
              type="date"
              min={departureDate || today}
              disabled={tripType !== "round_trip"}
              value={returnDate}
              onChange={(event) => setReturnDate(event.target.value)}
              className="w-full bg-transparent text-lg font-bold text-black outline-none disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>
        </div>

        <div className="relative col-span-4 flex min-h-[86px] items-center gap-3 rounded-[8px] border-2 border-primary px-4 xl:col-span-1">
          <InputLabel
            label={
              <>
                Passengers <span className="text-red-600">*</span> - Class{" "}
                <span className="text-red-600">*</span>
              </>
            }
          />

          <div className="w-1/2">
            <Label
              htmlFor="passengers"
              className="mb-1 block text-sm font-medium"
            >
              Passengers
            </Label>

            <select
              id="passengers"
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
              className="w-full bg-transparent text-base font-bold outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <option key={number} value={number}>
                  {number} {number === 1 ? "person" : "people"}
                </option>
              ))}
            </select>
          </div>

          <div className="w-1/2">
            <Label
              htmlFor="cabin-class"
              className="mb-1 block text-sm font-medium"
            >
              Class
            </Label>

            <select
              id="cabin-class"
              value={cabinClass}
              onChange={(event) => setCabinClass(event.target.value)}
              className="w-full bg-transparent text-base font-bold outline-none"
            >
              <option value="economy">Economy</option>
              <option value="premium-economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          disabled={isSubmitting}
          type="submit"
          className="h-[52px] w-[145px] gap-1 bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
        >
          {isSubmitting ? (
            <Loader className="animate-spin" />
          ) : (
            <>
              <Image
                width={24}
                height={24}
                src="/icons/paper-plane-filled.svg"
                alt="Paper plane"
              />

              <span>Show Flights</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function InputLabel({ label, className }) {
  return (
    <span
      className={cn(
        "absolute -top-[10px] left-[10px] z-10 inline-block rounded-md bg-white px-[4px] text-sm font-medium leading-none text-black",
        className,
      )}
    >
      {label}
    </span>
  );
}

export { SearchFlightsForm };
