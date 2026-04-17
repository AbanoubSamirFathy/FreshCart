"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { apiServices } from "@/app/services/api";
import { getClientAuthToken } from "@/lib/auth-client";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { AddToFavoriteButtonProps } from "../interfaces/AddToFavoriteButtonProps";
const GUEST_WISHLIST_STORAGE_KEY = "guestWishlistProductIds";


function getGuestWishlistProductIds() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  const storedWishlist = window.localStorage.getItem(
    GUEST_WISHLIST_STORAGE_KEY,
  );

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

function addProductToGuestWishlist(productId: string) {
  const currentProductIds = getGuestWishlistProductIds();

  if (currentProductIds.includes(productId)) {
    return currentProductIds;
  }

  const nextProductIds = [...currentProductIds, productId];
  saveGuestWishlistProductIds(nextProductIds);
  return nextProductIds;
}

function removeProductFromGuestWishlist(productId: string) {
  const nextProductIds = getGuestWishlistProductIds().filter(
    (id) => id !== productId,
  );
  saveGuestWishlistProductIds(nextProductIds);
  return nextProductIds;
}


export default function AddToFavoriteButton({
  product,
  productId,
  children,
  className,
}: AddToFavoriteButtonProps) {
  const id = productId || product?._id;
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      setIsWishlisted(getGuestWishlistProductIds().includes(id));
    }
  }, [id]);

  async function handleWishlistToggle(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();

    if (isUpdatingWishlist || !id) {
      return;
    }

    try {
      setIsUpdatingWishlist(true);
      const token = await getClientAuthToken();

      if (isWishlisted) {
        removeProductFromGuestWishlist(id);

        if (token) {
          await apiServices.removeProductFromWishlist(id, token);
        }

        setIsWishlisted(false);
        toast.success("Removed from favorites");
        return;
      }

      addProductToGuestWishlist(id);

      if (token) {
        await apiServices.addProductToWishlist(id, token);
      }

      setIsWishlisted(true);
      toast.success("Product added to favorites");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to update wishlist.";
      toast.error(errorMessage);
      window.alert(errorMessage);
    } finally {
      setIsUpdatingWishlist(false);
    }
  }

  if (children && className) {
    return (
      <button
        type="button"
        className={className}
        onClick={handleWishlistToggle}
        disabled={isUpdatingWishlist}
        aria-label={
          isWishlisted
            ? "Product removed from favorites"
            : "Product added to favorites"
        }
      >
        {children}
      </button>
    );
  }

  return (
    <div>
      {" "}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-no-card-click
            data-tooltip-target="tooltip-add-to-favorites"
            aria-label={
              isWishlisted
                ? "Remove product from favorites"
                : "Add product to favorites"
            }
            className={`rounded-lg transition-colors ${
              isWishlisted
                ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            }`}
            onClick={handleWishlistToggle}
            disabled={isUpdatingWishlist}
          >
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill={isWishlisted ? "currentColor" : "none"}
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z"
              />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isUpdatingWishlist
              ? "Updating..."
              : isWishlisted
                ? "Remove from Favorites"
                : "Add to Favorites"}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
