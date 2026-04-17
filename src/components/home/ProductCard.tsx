"use client";

import { useRouter } from "next/navigation";
import { IProduct } from "../interfaces/IProduct";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddToCartButton from "@/components/cart/AddToCartButton";
import AddToFavoriteButton from "../cart/AddToFavoriteButton";
const TOTAL_STARS = 5;

function getStarType(rating: number, starNumber: number) {
  if (rating >= starNumber) {
    return "full";
  }

  if (rating >= starNumber - 0.5) {
    return "half";
  }

  return "empty";
}

function formatPrice(price?: number | null) {
  if (typeof price !== "number") return "0";
  return price.toLocaleString("en-EG");
}

function hasDiscount(product: IProduct) {
  return (
    typeof product.priceAfterDiscount === "number" &&
    product.priceAfterDiscount < product.price
  );
}

function getDiscountPercentage(product: IProduct) {
  if (!hasDiscount(product) || typeof product.priceAfterDiscount !== "number") {
    return 0;
  }

  return Math.round(
    ((product.price - product.priceAfterDiscount) / product.price) * 100,
  );
}

export default function ProductCard({ product }: { product: IProduct }) {
  const router = useRouter();

  function goToProductDetails() {
    router.push("/productDetails/" + product._id);
  }

  return (
    <div className="product-card rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
      <div
        className="cursor-pointer"
        onClick={goToProductDetails}
        role="link"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            goToProductDetails();
          }
        }}
      >
        <div className="flex h-56 w-full items-center justify-center overflow-hidden">
          <div className="flex h-full w-full items-center justify-center">
            <img
              className="mx-auto h-full w-full object-contain dark:hidden"
              src={product.imageCover}
              alt="product-img"
            />
          </div>
        </div>
        <div className="pt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasDiscount(product) ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Save {getDiscountPercentage(product)}%
                </span>
              ) : null}
              {product.category?.name ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {product.category.name}
                </span>
              ) : null}
            </div>
            <div className="flex items-baseline gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    data-no-card-click
                    data-tooltip-target="tooltip-quick-look"
                    className="rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={(event) => {
                      event.stopPropagation();
                      goToProductDetails();
                    }}
                  >
                    <svg
                      className="h-5 w-5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeWidth={2}
                        d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                      />
                      <path
                        stroke="currentColor"
                        strokeWidth={2}
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Go to Product Details</p>
                </TooltipContent>
              </Tooltip>
              <AddToFavoriteButton product={product} />
            </div>
          </div>
          <div className="text-left text-lg font-semibold leading-tight text-gray-900 dark:text-white">
            {product.title.split(" ").slice(0, 7).join(" ")}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: TOTAL_STARS }, (_, index) => {
                const rating = product.ratingsAverage ?? 0;
                const starType = getStarType(rating, index + 1);

                return (
                  <div
                    key={`${product._id}-star-${index}`}
                    className="relative h-4 w-4"
                  >
                    <svg
                      className="absolute inset-0 h-4 w-4 text-gray-300"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                    </svg>
                    {starType !== "empty" ? (
                      <div
                        className={`absolute inset-0 overflow-hidden ${
                          starType === "half" ? "w-1/2" : "w-full"
                        }`}
                      >
                        <svg
                          className="h-4 w-4 text-yellow-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {product.ratingsAverage}
            </p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              ({product.ratingsQuantity})
            </p>
          </div>
          <ul className="mt-2 flex items-center gap-4">
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-gray-500 dark:text-gray-400"
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
                  d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Fast Delivery
              </p>
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2}
                  d="M8 7V6c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-1M3 18v-7c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Best Price
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {hasDiscount(product) ? (
            <>
              <p className="whitespace-nowrap text-2xl font-extrabold leading-tight text-green-700 dark:text-green-300">
                {formatPrice(product.priceAfterDiscount)} EGP
              </p>
              <span className="inline-flex whitespace-nowrap text-lg text-gray-500 line-through dark:text-gray-400">
                {formatPrice(product.price)} EGP
              </span>
            </>
          ) : (
            <p className="whitespace-nowrap text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
              {formatPrice(product.price)} EGP
            </p>
          )}
        </div>
        <div>
          <AddToCartButton
            productId={product._id}
            data-no-card-click
            className="rounded-xl bg-green-600 p-4 text-md font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <i className="fa-solid fa-plus"></i>
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}
