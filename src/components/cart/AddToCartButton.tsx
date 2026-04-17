"use client";

import { forwardRef, useState } from "react";
import { toast } from "sonner";
import { apiServices } from "@/app/services/api";
import { getClientAuthToken } from "@/lib/auth-client";
import { addGuestCartItem, dispatchCartUpdated } from "@/lib/cart-client";

interface AddToCartButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  productId: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const AddToCartButton = forwardRef<HTMLButtonElement, AddToCartButtonProps>(
  function AddToCartButton(
    { productId, children, onClick, disabled, type = "button", ...props },
    ref,
  ) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    async function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
      event.stopPropagation();
      event.preventDefault();

      if (isAddingToCart || disabled) {
        return;
      }

      try {
        setIsAddingToCart(true);
        onClick?.(event);

        addGuestCartItem(productId);
        dispatchCartUpdated();

        const token = await getClientAuthToken();

        if (token) {
          try {
            await apiServices.addProductToCart(productId, token);
          } catch {
          }
        }
        toast.success("Product added to cart.");
      } catch {
        toast.error("Unable to add product to cart.");
      } finally {
        setIsAddingToCart(false);
      }
    }

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        data-no-card-click
        onClick={handleAddToCart}
        disabled={disabled || isAddingToCart}
      >
        {children}
      </button>
    );
  },
);

export default AddToCartButton;
