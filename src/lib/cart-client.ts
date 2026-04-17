"use client";

export const GUEST_CART_STORAGE_KEY = "guestCartItems";
export const CART_UPDATED_EVENT = "cart-updated";

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }

  return Math.floor(quantity);
}

export function getGuestCartItems() {
  if (!isBrowser()) {
    return [] as GuestCartItem[];
  }

  const storedCart = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);

  if (!storedCart) {
    return [] as GuestCartItem[];
  }

  try {
    const parsedCart = JSON.parse(storedCart) as GuestCartItem[];

    if (!Array.isArray(parsedCart)) {
      return [] as GuestCartItem[];
    }

    return parsedCart
      .filter(
        (item) =>
          item &&
          typeof item.productId === "string" &&
          typeof item.quantity === "number",
      )
      .map((item) => ({
        productId: item.productId,
        quantity: normalizeQuantity(item.quantity),
      }));
  } catch {
    return [] as GuestCartItem[];
  }
}

export function saveGuestCartItems(items: GuestCartItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
}

export function getGuestCartCount() {
  return getGuestCartItems().reduce((total, item) => total + item.quantity, 0);
}

export function dispatchCartUpdated() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: { count: getGuestCartCount() },
    }),
  );
}

export function addGuestCartItem(productId: string, quantity = 1) {
  const nextQuantity = normalizeQuantity(quantity);
  const currentItems = getGuestCartItems();
  const existingItem = currentItems.find((item) => item.productId === productId);

  const nextItems = existingItem
    ? currentItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + nextQuantity }
          : item,
      )
    : [...currentItems, { productId, quantity: nextQuantity }];

  saveGuestCartItems(nextItems);
  dispatchCartUpdated();
  return nextItems;
}

export function updateGuestCartItemQuantity(productId: string, quantity: number) {
  const normalizedQuantity = Math.floor(quantity);

  if (normalizedQuantity < 1) {
    return removeGuestCartItem(productId);
  }

  const nextItems = getGuestCartItems().map((item) =>
    item.productId === productId
      ? { ...item, quantity: normalizedQuantity }
      : item,
  );

  saveGuestCartItems(nextItems);
  dispatchCartUpdated();
  return nextItems;
}

export function removeGuestCartItem(productId: string) {
  const nextItems = getGuestCartItems().filter(
    (item) => item.productId !== productId,
  );

  saveGuestCartItems(nextItems);
  dispatchCartUpdated();
  return nextItems;
}

export function clearGuestCart() {
  saveGuestCartItems([]);
  dispatchCartUpdated();
}
