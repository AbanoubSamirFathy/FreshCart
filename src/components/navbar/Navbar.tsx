"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiServices } from "@/app/services/api";
import { getClientAuthToken } from "@/lib/auth-client";
import { CART_UPDATED_EVENT, getGuestCartCount } from "@/lib/cart-client";

const links = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Brands", href: "/brands" },
];

const categories = [
  { name: "All Categories", href: "/categories" },
  { name: "Beauty & Health", href: "/categories/beauty" },
  { name: "Electronics", href: "/categories/electronics" },
  { name: "Men's Fashion", href: "/categories/men-fashion" },
  { name: "Women's Fashion", href: "/categories/women-fashion" },
];

export default function Navbar() {
  const router = useRouter();
  const pathName = usePathname();
  const session = useSession();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function syncCartCount() {
      const guestCount = getGuestCartCount();
      const token = await getClientAuthToken();

      if (!token) {
        setCartCount(guestCount);
        return;
      }

      try {
        const result = await apiServices.getCart(token);
        const serverCount =
          result.numOfCartItems ??
          result.data?.products.reduce((total, item) => total + item.count, 0) ??
          0;

        setCartCount(Math.max(serverCount, guestCount));
      } catch {
        setCartCount(guestCount);
      }
    }

    void syncCartCount();

    function handleCartUpdated() {
      void syncCartCount();
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, [session.status]);

  const isActiveLink = (href: string) =>
    href === "/" ? pathName === "/" : pathName.startsWith(href);

  const linkClassName = (href: string) =>
    isActiveLink(href)
      ? "text-green-700 font-semibold"
      : "text-heading transition-colors hover:text-green-700";

  const isCategoriesRoute = pathName.startsWith("/categories");

  return (
    <nav className="fixed start-0 top-0 z-20 w-full border-b border-default bg-white">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <i className="fa-solid fa-cart-shopping text-xl text-green-600" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-heading">
            FreshCart
          </span>
        </Link>

        <div className="flex items-center md:order-2 gap-5">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/wishlist"
                  data-tooltip-target="tooltip-add-to-favorites"
                  className="rounded-full p-2 text-gray-500 text-lg hover:bg-gray-100 hover:text-green-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <i className="fa-regular fa-heart"></i>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to Wishlist</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/cart"
                  data-tooltip-target="tooltip-quick-look"
                  className="relative rounded-full p-2 text-lg text-gray-500 hover:bg-gray-100 hover:text-green-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                  {cartCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to Cart</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-collapse-toggle="navbar-search"
              aria-controls="navbar-search"
              aria-expanded="false"
              className="box-border flex h-10 w-10 items-center justify-center rounded-base border border-transparent bg-transparent text-body hover:bg-neutral-secondary-medium hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary md:hidden"
            >
              <svg
                className="h-6 w-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2}
                  d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search</span>
            </button>

            <div className="relative hidden md:block">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                <svg
                  className="h-4 w-4 text-body"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth={2}
                    d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="input-group-1"
                className="block w-full rounded-base border border-default-medium bg-neutral-secondary-medium px-2.5 py-2 ps-9 pe-3 text-sm text-heading shadow-xs placeholder:text-body focus:border-brand focus:ring-brand"
                placeholder="Search"
              />
            </div>

            <button
              data-collapse-toggle="navbar-search"
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-base p-2 text-sm text-body hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary md:hidden"
              aria-controls="navbar-search"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2}
                  d="M5 7h14M5 12h14M5 17h14"
                />
              </svg>
            </button>
            {session.status === "unauthenticated" && (
              <Button
                className="bg-green-600 p-5 text-md"
                onClick={() => router.push("/auth/signin")}
              >
                Sign In
              </Button>
            )}
            {session.status === "authenticated" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-green-600 p-5 text-md"><i className="fa-solid fa-user"></i></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/orders")}>Orders</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="hover:text-green-600"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div
          className="hidden w-full items-center justify-between md:order-1 md:flex md:w-auto"
          id="navbar-search"
        >
          <div className="relative mt-3 md:hidden">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
              <svg
                className="h-4 w-4 text-body"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2}
                  d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="mobile-input-group-1"
              className="block w-full rounded-base border border-default-medium bg-neutral-secondary-medium px-2.5 py-2 ps-9 pe-3 text-sm text-heading shadow-xs placeholder:text-body focus:border-brand focus:ring-brand"
              placeholder="Search"
            />
          </div>

          <ul className="mt-4 flex flex-col rounded-base border border-default bg-neutral-secondary-soft p-4 font-medium md:mt-0 md:flex-row md:items-center md:space-x-8 md:border-0 md:bg-neutral-primary rtl:space-x-reverse md:p-0">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClassName(link.href)}>
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-base px-0 py-2 transition-colors hover:text-green-700 ${
                      isCategoriesRoute
                        ? "font-semibold text-green-700"
                        : "text-heading"
                    }`}
                  >
                    Categories
                    <svg
                      className="h-4 w-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 rounded-base border border-default bg-white p-2 shadow-lg"
                >
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.href}
                      asChild
                      className="rounded-base px-3 py-2 text-sm font-medium text-heading transition-colors focus:bg-neutral-secondary-soft focus:text-green-700"
                    >
                      <Link
                        href={category.href}
                        className="w-full cursor-pointer"
                      >
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
