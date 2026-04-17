"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiServices } from "../../services/api";
import { IProduct } from "@/components/interfaces/IProduct";
import { getProductDetailsRoute } from "@/lib/routes";
import { getClientAuthToken } from "@/lib/auth-client";

const GUEST_WISHLIST_STORAGE_KEY = "guestWishlistProductIds";

function formatPrice(price?: number | null) {
  if (typeof price !== "number") return "0";
  return price.toLocaleString("en-EG");
}

function getGuestWishlistProductIds() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  const storedWishlist = window.localStorage.getItem(GUEST_WISHLIST_STORAGE_KEY);

  if (!storedWishlist) {
    return [] as string[];
  }

  try {
    const parsedWishlist = JSON.parse(storedWishlist) as string[];
    return Array.isArray(parsedWishlist) ? parsedWishlist : [];
  } catch {
    return [] as string[];
  }
}

function saveGuestWishlistProductIds(productIds: string[]) {
  window.localStorage.setItem(
    GUEST_WISHLIST_STORAGE_KEY,
    JSON.stringify(productIds),
  );
}

export default function WishlistPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWishlistProducts() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const wishlistProductIds = getGuestWishlistProductIds();

        if (!wishlistProductIds.length) {
          if (isMounted) {
            setProducts([]);
          }
          return;
        }

        const allProducts = await apiServices.getProducts();
        const wishlistProducts = allProducts.filter((product) =>
          wishlistProductIds.includes(product._id),
        );

        if (isMounted) {
          setProducts(wishlistProducts);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("Unable to load your wishlist right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWishlistProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleRemove(productId: string) {
    const nextProductIds = getGuestWishlistProductIds().filter((id) => id !== productId);
    saveGuestWishlistProductIds(nextProductIds);
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product._id !== productId),
    );

    const token = await getClientAuthToken();

    if (!token) {
      return;
    }

    try {
      await apiServices.removeProductFromWishlist(productId, token);
    } catch {
      // Keep the guest wishlist responsive even if remote sync fails.
    }
  }

  const totalPrice = useMemo(
    () => products.reduce((sum, product) => sum + product.price, 0),
    [products],
  );

  return (
    <main className="bg-white px-4 pb-16 pt-28 dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Wishlist
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your saved items stay here even without signing in.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-green-600 hover:text-green-700 dark:border-gray-700 dark:text-gray-200"
          >
            Continue shopping
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Loading wishlist...
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {errorMessage}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Tap the heart icon on any product and we&apos;ll save it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {products.map((product) => {
                const productDetailsRoute = getProductDetailsRoute(product._id);

                return (
                  <div
                    key={product._id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Link
                      href={productDetailsRoute}
                      className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900"
                    >
                      <img
                        src={product.imageCover}
                        alt={product.title}
                        className="h-full w-full object-contain"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={productDetailsRoute}
                        className="line-clamp-2 text-lg font-semibold text-gray-900 hover:text-green-700 dark:text-white"
                      >
                        {product.title}
                      </Link>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {product.category?.name ?? "General"}
                      </p>
                      <p className="mt-3 text-xl font-bold text-green-700 dark:text-green-300">
                        {formatPrice(product.price)} EGP
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleRemove(product._id)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Summary
              </h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Saved items</span>
                  <span>{products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total value</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(totalPrice)} EGP
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
