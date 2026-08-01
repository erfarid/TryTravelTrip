"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { DatePicker } from "../local-ui/DatePicker";
import { FlightFromToPopover } from "../local-ui/FlightFromToPopover";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSelector, useDispatch } from "react-redux";
import {
  setFlightForm,
  defaultFlightFormValue,
} from "@/reduxStore/features/flightFormSlice";

import FlightPassengerAndClassSelector from "../local-ui/FlightPassengerAndClassSelector";

import {
  isDateObjValid,
  passengerObjectToStr,
  cn,
  airportObjectToStr,
  parseFlightSearchParams,
} from "@/lib/utils";

import validateFlightSearchParams from "@/lib/zodSchemas/flightSearchParams";
import { addDays, format } from "date-fns";

import swap from "@/public/icons/swap.svg";
import { ErrorMessage } from "../local-ui/errorMessage";

import { forwardRef, useEffect, useState } from "react";
import { getCookiesAction } from "@/lib/actions";

import Jumper, { jumpTo } from "../local-ui/Jumper";
import { Skeleton } from "../ui/skeleton";
import { Loader } from "lucide-react";

import addToSearchHistoryAction from "@/lib/actions/addToSearchHistoryAction";

/*
  Your Travelpayouts information:

  Partner ID / marker: 687738
  Kiwi campaign ID: 111
  Kiwi promo ID for custom links: 3791
*/
const TRAVELPAYOUTS_MARKER = "687738.trytraveltrip";

/*
  Creates the Kiwi search URL.

  Example:
  https://www.kiwi.com/deep
    ?from=BUD
    &to=DEL
    &departure=2026-08-20
    &return=2026-08-30
*/
function buildKiwiSearchUrl({ from, to, departureDate, returnDate }) {
  const kiwiUrl = new URL("https://www.kiwi.com/deep");

  kiwiUrl.searchParams.set("from", from);
  kiwiUrl.searchParams.set("to", to);
  kiwiUrl.searchParams.set("departure", departureDate);

  if (returnDate) {
    kiwiUrl.searchParams.set("return", returnDate);
  }

  return kiwiUrl.toString();
}

/*
  Wraps the Kiwi search URL inside your Travelpayouts affiliate URL.

  URLSearchParams automatically URL-encodes custom_url.
*/
function buildKiwiAffiliateUrl(searchUrl) {
  const affiliateUrl = new URL("https://c111.travelpayouts.com/click");

  affiliateUrl.searchParams.set("shmarker", TRAVELPAYOUTS_MARKER);

  affiliateUrl.searchParams.set("promo_id", "3791");
  affiliateUrl.searchParams.set("source_type", "customlink");
  affiliateUrl.searchParams.set("type", "click");
  affiliateUrl.searchParams.set("custom_url", searchUrl);

  return affiliateUrl.toString();
}

const DatePickerCustomInput = forwardRef(
  ({ loading, open, setOpen, value, onClick, className }, ref) => {
    return loading ? (
      <div className="h-full w-full p-3">
        <Skeleton className="mb-2 h-8 w-[130px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    ) : isDateObjValid(value) ? (
      <div
        ref={ref}
        onClick={(event) => {
          onClick(event);
          setOpen(!open);
        }}
        className={cn("h-full w-full cursor-pointer p-3", className)}
      >
        <div className="text-lg font-bold text-black">
          {format(new Date(value), "dd MMM yy")}
        </div>

        <div className="text-sm font-medium text-black">
          {format(new Date(value), "EEEE")}
        </div>
      </div>
    ) : (
      <div
        ref={ref}
        onClick={(event) => {
          onClick(event);
          setOpen(!open);
        }}
        className={cn("h-full w-full cursor-pointer p-3", className)}
      >
        <div className="text-lg font-bold text-black">DD MMM YY</div>

        <div className="text-sm font-medium text-black">Weekday</div>
      </div>
    );
  },
);

DatePickerCustomInput.displayName = "DatePickerCustomInput";

function SearchFlightsForm({ params = {} }) {
  const dispatch = useDispatch();

  const flightFormData = useSelector((state) => state.flightForm.value);

  const errors = flightFormData?.errors || {};

  const [popperOpened, setPopperOpened] = useState(false);

  const [isFormLoading, setIsFormLoading] = useState(false);

  const [isLoadingDateRange, setIsLoadingDateRange] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
    Restore the previous search state from the URL or cookies.
  */
  useEffect(() => {
    async function loadSearchState() {
      setIsFormLoading(true);

      if ("query" in params) {
        const stateFromParams = getSearchStateParams();

        const newFormData = {
          ...defaultFlightFormValue,
          ...stateFromParams,
        };

        if (Object.keys(newFormData?.errors || {}).length > 0) {
          dispatch(setFlightForm(newFormData));
        } else {
          dispatch(
            setFlightForm({
              ...defaultFlightFormValue,
              ...parseFlightSearchParams(stateFromParams),
            }),
          );
        }

        setIsFormLoading(false);
        return;
      }

      const searchState = await getSearchStateCookies();

      if (Object.keys(searchState?.errors || {}).length > 0) {
        dispatch(
          setFlightForm({
            ...defaultFlightFormValue,
            ...searchState,
          }),
        );
      } else {
        dispatch(
          setFlightForm({
            ...defaultFlightFormValue,
            ...parseFlightSearchParams(searchState),
          }),
        );
      }

      setIsFormLoading(false);
    }

    loadSearchState();

    const timeout = setTimeout(() => {
      jumpTo("flightResult");
    }, 500);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
    Load the available date range used by your current
    date-picker component.
  */
  useEffect(() => {
    const controller = new AbortController();

    async function getAvailableFlightDateRange() {
      setIsLoadingDateRange(true);

      const cachedFlightDateRange = sessionStorage.getItem("flightDateRange");

      if (cachedFlightDateRange) {
        const { from, to, expireAt } = JSON.parse(cachedFlightDateRange);

        if (Date.now() < expireAt) {
          dispatch(
            setFlightForm({
              availableFlightDateRange: {
                from,
                to,
              },
            }),
          );

          setIsLoadingDateRange(false);
          return;
        }
      }

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

        const response = await fetch(
          `${baseUrl}/api/flights/available_flight_date_range`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        const result = await response.json();

        if (result.success === true) {
          const { from, to } = result.data;

          sessionStorage.setItem(
            "flightDateRange",
            JSON.stringify({
              from,
              to,
              expireAt: Date.now() + 10 * 60 * 1000,
            }),
          );

          dispatch(
            setFlightForm({
              availableFlightDateRange: {
                from,
                to,
              },
            }),
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Could not load the flight date range:", error);
        }
      } finally {
        setIsLoadingDateRange(false);
      }
    }

    getAvailableFlightDateRange();

    return () => {
      controller.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popperOpened]);

  /*
    The new submit handler:

    1. Validates your current form.
    2. Reads the IATA airport codes.
    3. Creates a Kiwi pre-filled search.
    4. Adds your Travelpayouts affiliate tracking.
    5. Redirects the user.
  */
  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    const {
      success,
      errors: validationErrors,
      data: validatedFormData,
    } = validateFlightForm(flightFormData);

    if (success === false) {
      dispatch(
        setFlightForm({
          errors: {
            ...validationErrors,
          },
        }),
      );

      setIsSubmitting(false);
      return;
    }

    const fromCode = flightFormData?.from?.iataCode?.trim();

    const toCode = flightFormData?.to?.iataCode?.trim();

    const departureDate = flightFormData?.desiredDepartureDate;

    const returnDate =
      flightFormData?.tripType === "round_trip"
        ? flightFormData?.desiredReturnDate
        : "";

    if (!fromCode || !toCode) {
      dispatch(
        setFlightForm({
          errors: {
            from: !fromCode ? "Please select a departure airport." : undefined,
            to: !toCode ? "Please select a destination airport." : undefined,
          },
        }),
      );

      setIsSubmitting(false);
      return;
    }

    if (!departureDate) {
      dispatch(
        setFlightForm({
          errors: {
            desiredDepartureDate: "Please select a departure date.",
          },
        }),
      );

      setIsSubmitting(false);
      return;
    }

    try {
      /*
        Save the search using your existing action.
        Failure here should not prevent the redirect.
      */
      try {
        await addToSearchHistoryAction("flight", validatedFormData);
      } catch (historyError) {
        console.error("Could not save flight search history:", historyError);
      }

      sessionStorage.removeItem("passengersDetails");

      dispatch(
        setFlightForm({
          errors: {},
        }),
      );

      const kiwiSearchUrl = buildKiwiSearchUrl({
        from: fromCode.toUpperCase(),
        to: toCode.toUpperCase(),
        departureDate,
        returnDate,
      });

      const affiliateUrl = buildKiwiAffiliateUrl(kiwiSearchUrl);

      /*
        Open in the same tab.

        Change this to window.open(...) if you prefer
        Kiwi to open in a new tab.
      */
      window.location.assign(affiliateUrl);
    } catch (error) {
      console.error("Could not redirect to Kiwi:", error);

      dispatch(
        setFlightForm({
          errors: {
            submit: "The flight search could not be opened. Please try again.",
          },
        }),
      );

      setIsSubmitting(false);
    }
  }

  async function getSearchStateCookies() {
    try {
      const state =
        (await getCookiesAction(["flightSearchState"]))[0]?.value || "{}";

      if (state === "{}") {
        return {
          errors: {},
        };
      }

      const parsedState = JSON.parse(state);

      const validation = validateFlightSearchParams(parsedState);

      return {
        ...(validation?.data || {}),
        errors: validation?.errors || {},
      };
    } catch (error) {
      return {
        errors: {},
      };
    }
  }

  function getSearchStateParams() {
    try {
      const searchParams = new URLSearchParams(
        decodeURIComponent(params?.query || ""),
      );

      const paramsObject = Object.fromEntries(searchParams);

      const validation = validateFlightSearchParams(paramsObject);

      return {
        ...(validation?.data || {}),
        errors: validation?.errors || {},
      };
    } catch (error) {
      return {
        errors: {},
      };
    }
  }

  function validateFlightForm(formData) {
    const necessaryData = {
      from: airportObjectToStr(formData.from),

      to: airportObjectToStr(formData.to),

      tripType: formData.tripType,

      desiredDepartureDate: formData.desiredDepartureDate,

      desiredReturnDate: formData.desiredReturnDate,

      class: formData.class,

      passengers: passengerObjectToStr(formData.passengers),
    };

    const validation = validateFlightSearchParams(necessaryData);

    return {
      success: validation.success,
      errors: validation.errors || {},
      data: validation.data || {},
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return (
    <>
      <Jumper id="flightFormJump" />

      <form
        id="flightform"
        method="get"
        onSubmit={handleSubmit}
        className="text-black"
      >
        <div className="my-2 grid grid-cols-4 gap-1 xl:grid-cols-5">
          <div className="col-span-full">
            {Object.keys(errors).length > 0 && (
              <ErrorMessage
                message={
                  <ol>
                    {Object.entries(errors)
                      .filter(([, message]) => Boolean(message))
                      .map(([field, message]) => (
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
            <span
              className={cn(
                "font-bold text-black",
                errors?.tripType && "text-destructive",
              )}
            >
              Trip Type
            </span>

            {isFormLoading ? (
              <Skeleton className="h-4 w-[80%]" />
            ) : (
              <TripTypeRadioGroup
                defaultValue={flightFormData.tripType}
                getValue={(value) => {
                  if (value === "round_trip") {
                    const departure = flightFormData.desiredDepartureDate
                      ? new Date(flightFormData.desiredDepartureDate)
                      : new Date();

                    dispatch(
                      setFlightForm({
                        ...flightFormData,
                        tripType: value,
                        desiredReturnDate: addDays(departure, 1).toISOString(),
                      }),
                    );
                  } else {
                    dispatch(
                      setFlightForm({
                        ...flightFormData,
                        tripType: value,
                        desiredReturnDate: "",
                      }),
                    );
                  }
                }}
              />
            )}
          </div>

          <div
            className={cn(
              "relative col-span-full flex h-auto flex-col gap-2 rounded-[8px] border-2 border-primary md:flex-row lg:col-span-2",
              (errors?.to || errors?.from) && "border-destructive",
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

            <FlightFromToPopover
              className={cn(
                "h-auto max-h-[72px] min-h-[72px] max-w-full grow rounded-none border-0 border-primary px-3 py-2 max-md:mx-1 max-md:border-b-2 md:my-1 md:w-1/2 md:border-r-2",
                errors?.from && "border-destructive",
              )}
              isLoading={isFormLoading}
              fetchInputs={{
                url: `${baseUrl}/api/flights/available_airports`,
                method: "GET",
                searchParamsName: "searchQuery",
                next: {
                  revalidate: 21600,
                  tags: ["airports"],
                },
              }}
              excludeVals={[flightFormData.to]}
              defaultSelected={flightFormData.from}
              getSelected={(airport) =>
                dispatch(
                  setFlightForm({
                    ...flightFormData,
                    from: {
                      iataCode: airport.iataCode,
                      name: airport.name,
                      city: airport.city,
                    },
                  }),
                )
              }
            />

            <button
              onClick={() => {
                dispatch(
                  setFlightForm({
                    ...flightFormData,
                    from: flightFormData.to,
                    to: flightFormData.from,
                  }),
                );
              }}
              aria-label="Swap airports"
              type="button"
              className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary p-2 transition-all hover:border-2 hover:border-primary hover:bg-secondary-foreground"
            >
              <Image
                alt=""
                className="min-h-[16px] min-w-[16px] max-md:rotate-90"
                width={18}
                height={22}
                src={swap}
              />
            </button>

            <FlightFromToPopover
              className={cn(
                "h-auto max-h-[72px] min-h-[72px] max-w-full grow rounded-none border-0 border-primary px-3 py-2 max-md:mx-1 max-md:border-t-2 md:my-1 md:w-1/2 md:border-l-2",
                errors?.to && "border-destructive",
              )}
              isLoading={isFormLoading}
              fetchInputs={{
                url: `${baseUrl}/api/flights/available_airports`,
                method: "GET",
                next: {
                  revalidate: 21600,
                  tags: ["airports"],
                },
                searchParamsName: "searchQuery",
              }}
              excludeVals={[flightFormData.from]}
              defaultSelected={flightFormData.to}
              getSelected={(airport) =>
                dispatch(
                  setFlightForm({
                    ...flightFormData,
                    to: {
                      iataCode: airport.iataCode,
                      name: airport.name,
                      city: airport.city,
                    },
                  }),
                )
              }
            />
          </div>

          <div
            className={cn(
              "relative col-span-full flex h-auto flex-col gap-2 rounded-[8px] border-2 border-primary md:flex-row lg:col-span-2",
              (errors?.desiredDepartureDate || errors?.desiredReturnDate) &&
                "border-destructive",
            )}
          >
            <InputLabel
              label={
                <>
                  Depart <span className="text-red-600">*</span> - Return{" "}
                  {flightFormData.tripType === "round_trip" && (
                    <span className="text-red-600">*</span>
                  )}
                </>
              }
            />

            <div
              className={cn(
                "h-auto max-h-[72px] min-h-[72px] max-w-full grow rounded-none border-0 border-primary max-md:mx-1 max-md:border-b-2 md:my-1 md:w-1/2 md:border-r-2",
                errors?.desiredDepartureDate && "border-destructive",
              )}
            >
              <DatePicker
                date={flightFormData.desiredDepartureDate}
                loading={isLoadingDateRange || isFormLoading}
                minDate={
                  new Date(+flightFormData.availableFlightDateRange.from)
                }
                maxDate={new Date(+flightFormData.availableFlightDateRange.to)}
                setDate={(date) => {
                  let formattedDate = null;

                  if (isDateObjValid(date)) {
                    formattedDate = date.toLocaleString("en-CA", {
                      timeZone:
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    });
                  }

                  dispatch(
                    setFlightForm({
                      ...flightFormData,
                      desiredDepartureDate: formattedDate,
                    }),
                  );
                }}
                customInput={
                  <DatePickerCustomInput
                    open={popperOpened}
                    setOpen={setPopperOpened}
                    loading={isLoadingDateRange || isFormLoading}
                  />
                }
              />
            </div>

            <div
              className={cn(
                "h-auto max-h-[72px] min-h-[72px] max-w-full grow rounded-none border-0 border-primary max-md:mx-1 max-md:border-t-2 md:my-1 md:w-1/2 md:border-l-2",
                errors?.desiredReturnDate && "border-destructive",
              )}
            >
              <DatePicker
                className="!h-full !w-full"
                date={flightFormData.desiredReturnDate}
                loading={isLoadingDateRange || isFormLoading}
                required={false}
                minDate={
                  new Date(
                    flightFormData.desiredDepartureDate ||
                      +flightFormData.availableFlightDateRange.from,
                  )
                }
                maxDate={new Date(+flightFormData.availableFlightDateRange.to)}
                setDate={(date) => {
                  if (isDateObjValid(date)) {
                    const formattedDate = date.toLocaleString("en-CA", {
                      timeZone:
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    });

                    dispatch(
                      setFlightForm({
                        ...flightFormData,
                        tripType: "round_trip",
                        desiredReturnDate: formattedDate,
                      }),
                    );
                  } else {
                    dispatch(
                      setFlightForm({
                        ...flightFormData,
                        tripType: "one_way",
                        desiredReturnDate: "",
                      }),
                    );
                  }
                }}
                customInput={
                  <DatePickerCustomInput
                    open={popperOpened}
                    setOpen={setPopperOpened}
                    loading={isLoadingDateRange || isFormLoading}
                  />
                }
              />
            </div>
          </div>

          <div
            className={cn(
              "relative col-span-4 flex h-auto items-center gap-[4px] rounded-[8px] border-2 border-primary xl:col-span-1",
              (errors?.passengers || errors?.class) && "border-destructive",
            )}
          >
            <InputLabel
              label={
                <>
                  Passengers <span className="text-red-600">*</span> - Class{" "}
                  <span className="text-red-600">*</span>
                </>
              }
            />

            <FlightPassengerAndClassSelector
              isLoading={isFormLoading}
              flightFormData={flightFormData}
              errors={errors}
            />
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
    </>
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

function TripTypeRadioGroup({ defaultValue = "one_way", getValue = () => {} }) {
  return (
    <RadioGroup
      onValueChange={getValue}
      className="flex flex-wrap gap-3"
      value={defaultValue}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="one_way" id="one_way1234" />

        <Label htmlFor="one_way1234">One Way</Label>
      </div>

      <div className="flex items-center space-x-2">
        <RadioGroupItem value="round_trip" id="round_trip1234" />

        <Label htmlFor="round_trip1234">Round Trip</Label>
      </div>

      <div className="flex items-center space-x-2">
        <RadioGroupItem value="multi_city" id="multi_city1234" disabled />

        <Label
          className="cursor-not-allowed text-disabled"
          htmlFor="multi_city1234"
        >
          Multi City
        </Label>
      </div>
    </RadioGroup>
  );
}

export { SearchFlightsForm };
