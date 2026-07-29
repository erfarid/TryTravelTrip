import { ActiveNavLink } from "@/components/local-ui/nav/ActiveNavLink";
import { Logo } from "@/components/Logo";
import { AvatarWithName } from "@/components/local-ui/nav/AvatarWithName";
import LogoutBtn from "@/components/LogoutBtn";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SideBar } from "@/components/local-ui/nav/SideBar";
import { cn } from "@/lib/utils";

import routes from "@/data/routes.json";

import user from "@/public/icons/user.svg";
import card from "@/public/icons/card.svg";
import settings from "@/public/icons/settings.svg";
import Image from "next/image";
import { BookCopyIcon } from "lucide-react";
import { getUserDetails } from "@/lib/services/user";

export async function Nav({ className, type = "default", session, ...props }) {
  const isLoggedIn = Boolean(session?.user);

  let nameOfUser = "";
  let avatar = "";

  if (isLoggedIn) {
    try {
      const userData = await getUserDetails(session?.user?.id);

      avatar = userData?.profileImage || "";

      nameOfUser =
        `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim() ||
        session?.user?.name ||
        "Account";
    } catch (error) {
      nameOfUser = session?.user?.name || "Account";
    }
  }

  const sideBarLinksUser = [
    {
      title: "Profile",
      href: "/user/profile",
      icon: <Image src={user} alt="user" width={18} height={18} />,
    },
    {
      title: "My Bookings",
      href: "/user/my_bookings",
      icon: <BookCopyIcon size={18} />,
    },
    {
      title: "Payments",
      href: "/user/payments",
      icon: <Image src={card} alt="card" width={18} height={18} />,
    },
    {
      title: "Settings",
      href: "/user/settings",
      icon: <Image src={settings} alt="settings" width={18} height={18} />,
    },
  ];

  return (
    <nav
      className={cn(
        "relative flex h-[88px] w-full items-center justify-between overflow-hidden bg-white px-4 shadow-md lg:px-6",
        className,
      )}
      {...props}
    >
      {/* Logo */}
      <div className="relative z-10 flex flex-shrink-0 items-center">
        <Logo className="h-[92px] w-auto" />
      </div>

      {/* Desktop Navigation */}
      <div className="relative z-10 hidden flex-1 items-center justify-end lg:flex">
        <Link
          href="/help"
          className="mr-6 text-[16px] font-semibold text-gray-700 transition hover:text-[#2563eb]"
        >
          Help
        </Link>

        <div className="mr-8">
          <ActiveNavLink className="flex items-center gap-4 text-[16px] font-semibold text-gray-800" />
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <AvatarWithName
              sideBarLinksUser={sideBarLinksUser}
              profileName={nameOfUser}
              profilePic={avatar}
            />

            <LogoutBtn
              btnContent="Logout"
              className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
            />
          </div>
        ) : (
          <Button
            asChild
            className="h-9 rounded-md border-2 border-black bg-[#2f63ff] px-3 text-sm font-semibold text-white shadow hover:bg-[#1d4ed8]"
          >
            <Link href={routes.login.path}>Sign in/register</Link>
          </Button>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="relative z-10 lg:hidden">
        <SideBar isLoggedIn={isLoggedIn} sideBarLinksUser={sideBarLinksUser} />
      </div>
    </nav>
  );
}
