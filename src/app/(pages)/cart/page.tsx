"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiServices } from "../../services/api";
import { ICart } from "@/components/interfaces/cart/ICart";
import { ICartItem } from "@/components/interfaces/cart/ICartItem";
import { IProduct } from "@/components/interfaces/IProduct";
import { getClientAuthToken } from "@/lib/auth-client";
import {
  CART_UPDATED_EVENT,
  clearGuestCart,
  dispatchCartUpdated,
  getGuestCartItems,
  removeGuestCartItem,
  updateGuestCartItemQuantity,
} from "@/lib/cart-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GuestCartProductItem {
  product: IProduct;
  quantity: number;
}

function formatPrice(price?: number | null) {
  if (typeof price !== "number") return "0";
  return price.toLocaleString("en-EG");
}

function getCartItemImage(item: ICartItem) {
  return item.product.imageCover;
}

function getCartItemTitle(item: ICartItem) {
  return item.product.title;
}

function getCartItemPrice(item: ICartItem) {
  return item.price;
}

// function getGuestItemPrice(item: GuestCartProductItem) {
//   const price =
//     typeof item.product.priceAfterDiscount === "number"
//       ? item.product.priceAfterDiscount
//       : item.product.price;

//   return price * item.quantity;
// }

function getGuestItemPrice(item: GuestCartProductItem) {
  const price =
    typeof item.product.priceAfterDiscount === "number"
      ? item.product.priceAfterDiscount
      : typeof item.product.price === "number"
        ? item.product.price
        : 0;

  const quantity = typeof item.quantity === "number" ? item.quantity : 0;

  return price * quantity;
}

export default function CartPage() {
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<ICart | null>(null);
  const [guestItems, setGuestItems] = useState<GuestCartProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const router = useRouter();

  async function loadGuestCart() {
    const storedItems = getGuestCartItems();

    if (storedItems.length === 0) {
      setGuestItems([]);
      return;
    }

    const products = await Promise.all(
      storedItems.map(async (item) => ({
        product: await apiServices.getProductDetails(item.productId),
        quantity: item.quantity,
      })),
    );

    setGuestItems(products);
  }

  async function handleCashCheckout() {
    if (isMutating) {
      return;
    }

    if (!token || !cart?._id || !cart?.products || cart.products.length === 0) {
      toast.error(
        "Please sign in and make sure your cart has items before checkout.",
      );
      return;
    }

    try {
      setIsMutating(true);

      const addressesResponse = await apiServices.getLoggedUserAddresses(token);
      const addresses = addressesResponse.data ?? [];

      if (addresses.length === 0) {
        toast.error("Please add a shipping address before checkout.");
        location.href = "/address";
        return;
      }

      const selectedAddress = addresses[0];

      const response = await apiServices.createCashOrderFromCart(
        selectedAddress,
        cart,
        token,
      );

      if (response.status === "success") {
        setCart(null);
        dispatchCartUpdated();
        toast.success(response.message || "Cash order placed successfully.");
        router.push("/orders");
      } else {
        toast.error(
          response.message ||
            "Unable to place your cash order. Please try again.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to place your cash order.",
      );
    } finally {
      setIsMutating(false);
    }

    if (isNaN(totalPrice)) {
      toast.error("Invalid total price. Please refresh your cart.");
      return;
    }
  }
  async function handleCheckout() {
    if (isMutating) {
      return;
    }

    if (!token || !cart?._id || !cart?.products || cart.products.length === 0) {
      toast.error(
        "Please sign in and make sure your cart has items before checkout.",
      );
      return;
    }

    try {
      setIsMutating(true);

      // Check if user has addresses
      const addressesResponse = await apiServices.getLoggedUserAddresses(token);
      const addresses = addressesResponse.data ?? [];

      if (addresses.length === 0) {
        toast.error("Please add a shipping address before checkout.");
        location.href = "/address";
        return;
      }

      // Use the first address for checkout (or implement address selection)
      const selectedAddress = addresses[0];

      const response = await apiServices.checkout(selectedAddress, cart, token);

      if (response.session?.url) {
        toast.success("Redirecting to checkout...");
        location.href = response.session.url;
      } else {
        toast.error("Unable to proceed to checkout. Please try again.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to proceed to checkout.",
      );
    } finally {
      setIsMutating(false);
    }

    if (isNaN(totalPrice)) {
      toast.error("Invalid total price. Please refresh your cart.");
      return;
    }
  }

  const loadCartState = useEffectEvent(async () => {
    try {
      setIsLoading(true);
      await loadGuestCart();

      const resolvedToken = await getClientAuthToken();

      if (!resolvedToken) {
        setToken(null);
        setCart(null);
        return;
      }

      const result = await apiServices.getCart(resolvedToken);
      const hasServerItems = Boolean(result.data?.products.length);

      if (hasServerItems) {
        setToken(resolvedToken);
        setCart(result.data ?? null);
        setGuestItems([]);
        return;
      }

      setToken(null);
      setCart(null);
    } catch (error) {
      setToken(null);
      setCart(null);
      toast.error(
        error instanceof Error ? error.message : "Unable to load your cart.",
      );
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void loadCartState();
  }, []);

  useEffect(() => {
    function handleCartUpdated() {
      void loadCartState();
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, []);

  const guestTotal = guestItems.reduce(
    (total, item) => total + getGuestItemPrice(item),
    0,
  );

  const guestCount = guestItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  async function handleServerQuantityChange(itemId: string, count: number) {
    if (!token || isMutating) {
      return;
    }

    try {
      setIsMutating(true);
      const result = await apiServices.updateCartItemQuantity(
        itemId,
        count,
        token,
      );
      setCart(result.data ?? null);
      dispatchCartUpdated();
      toast.success("Cart updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update your cart.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleServerRemove(itemId: string) {
    if (!token || isMutating) {
      return;
    }

    try {
      setIsMutating(true);
      const result = await apiServices.removeCartItem(itemId, token);
      setCart(result.data ?? null);
      dispatchCartUpdated();
      toast.success("Item removed from cart.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove this item.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleServerClear() {
    if (!token || isMutating) {
      return;
    }

    try {
      setIsMutating(true);
      await apiServices.clearCart(token);
      setCart(null);
      dispatchCartUpdated();
      toast.success("Cart cleared.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to clear your cart.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  function handleGuestQuantityChange(productId: string, quantity: number) {
    if (isMutating) {
      return;
    }

    updateGuestCartItemQuantity(productId, quantity);
    setGuestItems((currentItems) =>
      currentItems
        .map((item) =>
          item.product._id === productId ? { ...item, quantity } : item,
        )
        .filter((item) => item.quantity > 0),
    );
    toast.success("Cart updated.");
  }

  function handleGuestRemove(productId: string) {
    removeGuestCartItem(productId);
    setGuestItems((currentItems) =>
      currentItems.filter((item) => item.product._id !== productId),
    );
    toast.success("Item removed from cart.");
  }

  function handleGuestClear() {
    clearGuestCart();
    setGuestItems([]);
    toast.success("Cart cleared.");
  }

  const isServerCart = Boolean(token);
  const serverItems = cart?.products ?? [];
  const itemCount = isServerCart
    ? serverItems.reduce((total, item) => total + item.count, 0)
    : guestCount;
  const totalPrice = isServerCart ? (cart?.totalCartPrice ?? 0) : guestTotal;
  const isEmpty = isServerCart
    ? serverItems.length === 0
    : guestItems.length === 0;

  return (
    <section className="min-h-screen bg-slate-50 py-24">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
            <p className="mt-2 text-sm text-slate-500">
              {isServerCart
                ? "Your signed-in cart is synced with the server."
                : "Your cart is stored locally in this browser until you sign in."}
            </p>
          </div>
          {!isEmpty ? (
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
              onClick={isServerCart ? handleServerClear : handleGuestClear}
              disabled={isMutating}
            >
              Clear cart
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading your cart...
          </div>
        ) : isEmpty ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Your cart is empty
            </h2>
            <p className="mt-3 text-slate-500">
              Add a few products and they will show up here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
            <div className="space-y-4">
              {isServerCart
                ? serverItems.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <img
                          src={getCartItemImage(item)}
                          alt={getCartItemTitle(item)}
                          className="h-24 w-24 rounded-xl object-contain"
                        />
                        <div className="min-w-0 flex-1">
                          <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">
                            {getCartItemTitle(item)}
                          </h2>
                          <p className="mt-2 text-sm text-slate-500">
                            {formatPrice(item.product.price)} EGP each
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                            onClick={() =>
                              handleServerQuantityChange(
                                item._id,
                                item.count - 1,
                              )
                            }
                            disabled={isMutating}
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center font-semibold text-slate-900">
                            {item.count}
                          </span>
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                            onClick={() =>
                              handleServerQuantityChange(
                                item._id,
                                item.count + 1,
                              )
                            }
                            disabled={isMutating}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {formatPrice(getCartItemPrice(item))} EGP
                          </p>
                          <button
                            type="button"
                            className="mt-2 text-sm font-medium text-red-500 transition hover:text-red-600"
                            onClick={() => handleServerRemove(item._id)}
                            disabled={isMutating}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                : guestItems.map((item) => (
                    <div
                      key={item.product._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <img
                          src={item.product.imageCover}
                          alt={item.product.title}
                          className="h-24 w-24 rounded-xl object-contain"
                        />
                        <div className="min-w-0 flex-1">
                          <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">
                            {item.product.title}
                          </h2>
                          <p className="mt-2 text-sm text-slate-500">
                            {formatPrice(
                              item.product.priceAfterDiscount ??
                                item.product.price,
                            )}{" "}
                            EGP each
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                            onClick={() =>
                              handleGuestQuantityChange(
                                item.product._id,
                                item.quantity - 1,
                              )
                            }
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                            onClick={() =>
                              handleGuestQuantityChange(
                                item.product._id,
                                item.quantity + 1,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {formatPrice(getGuestItemPrice(item))} EGP
                          </p>
                          <button
                            type="button"
                            className="mt-2 text-sm font-medium text-red-500 transition hover:text-red-600"
                            onClick={() => handleGuestRemove(item.product._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Summary</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)} EGP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)} EGP</span>
                </div>
              </div>
              <button
                type="button"
                className="flex justify-center gap-2 mt-6 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                onClick={handleCashCheckout}
              >
                {isMutating && <Loader2 className="animate-spin" />}
                Proceed to cash checkout
              </button>
              <button
                type="button"
                className="flex justify-center gap-2 mt-2 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                onClick={handleCheckout}
              >
                {isMutating && <Loader2 className="animate-spin" />}
                Proceed to online checkout
              </button>
              {!isServerCart ? (
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Sign in when you are ready and we can sync future cart actions
                  to your account.
                </p>
              ) : null}
              <button
                type="button"
                className="flex justify-center gap-2 mt-2 w-full rounded-xl bg-gray-200 px-5 py-3 font-semibold text-black transition hover:bg-gray-300"
                onClick={() => router.push("/")}
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}



