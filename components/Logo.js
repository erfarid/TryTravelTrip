import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }) {
  return (
    <Link
      href="/"
      aria-label="TryTravelTrip logo. Click to go to home page"
      className="inline-flex items-center"
    >
      <Image
        src="/logo.png"
        alt="TryTravelTrip"
        width={180}
        height={70}
        priority
        className={cn(
          "h-[55px] w-auto object-contain",
          className,
        )}
      />
    </Link>
  );
}