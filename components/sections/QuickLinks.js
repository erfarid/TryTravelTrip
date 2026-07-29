import Link from "next/link";
import { Logo } from "@/components/Logo";

export function QuickLinks() {
  const links = {
    "Our Destination": [
      {
        name: "Canada",
        href: "/",
      },
      {
        name: "Alaska",
        href: "#",
      },
      {
        name: "France",
        href: "#",
      },
      {
        name: "Iceland",
        href: "#",
      },
    ],
    "Our Activity": [
      {
        name: "Northern Lights",
        href: "#",
      },
      {
        name: "Cruising & Sailing",
        href: "#",
      },
      {
        name: "Multi-activities",
        href: "#",
      },
      {
        name: "Kayaking",
        href: "#",
      },
    ],
    "Travel Blogs": [
      {
        name: "Bali Travel Guide",
        href: "#",
      },
      {
        name: "Sri Lanka Travel Guide",
        href: "#",
      },
      {
        name: "Peru Travel Guide",
        href: "#",
      },
    ],
    "About Us": [
      {
        name: "Our Story",
        href: "#",
      },
      {
        name: "Work with Us",
        href: "#",
      },
    ],
    Contact: [
      {
        name: "Contact Us",
        href: "#",
      },
    ],
  };

  return (
    <section className="mx-auto flex w-[90%] gap-10 max-sm:flex-col sm:gap-20 lg:gap-28">
      <div className="shrink-0">
        <Logo
          className="block h-[70px] w-auto"
          worldFill="white"
          otherFill="black"
        />
      </div>

      <div className="grid grow justify-start gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Object.entries(links).map(([heading, items]) => (
          <div
            key={heading}
            className="text-[0.875rem] font-medium text-secondary/70"
          >
            <h3 className="mb-4 font-bold text-secondary">{heading}</h3>

            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.name}>
                  <Link
                    aria-label={`Link to ${item.name}`}
                    href={item.href}
                    className="inline text-[0.875rem] font-medium text-secondary/70 hover:underline"
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
