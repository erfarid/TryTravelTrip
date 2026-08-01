import Image from "next/image";

import { SearchFlightsForm } from "@/components/sections/SearchFlightsForm";
import { SearchStaysForm } from "@/components/sections/SearchStaysForm";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import airplane from "@/public/icons/airplane-filled.svg";
import bed from "@/public/icons/bed-filled.svg";

export function SearchFlightsAndStaysFormShortcut({ className }) {
  return (
    <div
      className={cn(
        "rounded-[12px] bg-white px-4 py-3 text-black shadow-xl md:rounded-[16px] md:px-6 md:py-4",
        className,
      )}
    >
      <Tabs defaultValue="flights" className="w-full text-black">
        <TabsList className="flex h-auto justify-start gap-1 bg-transparent p-0">
          <TabsTrigger
            value="flights"
            className="h-12 gap-2 px-4 text-black data-[state=active]:text-primary"
          >
            <Image src={airplane} alt="airplane_icon" width={22} height={22} />
            <span>Flights</span>
          </TabsTrigger>

          <TabsTrigger
            value="hotels"
            className="h-12 gap-2 px-4 text-black data-[state=active]:text-primary"
          >
            <Image src={bed} alt="bed_icon" width={22} height={22} />
            <span>Stays</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights" className="mt-2 text-black">
          <SearchFlightsForm />
        </TabsContent>

        <TabsContent value="hotels" className="mt-2 text-black">
          <SearchStaysForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
