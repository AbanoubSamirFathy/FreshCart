import { IBrand } from "@/components/interfaces/IBrand";
import { ICategory } from "@/components/interfaces/ICategory";
import { IProduct } from "@/components/interfaces/IProduct";
import { IWishlist } from "@/components/interfaces/IWishlist";
import { SignInResponse } from "@/types/SignInResponse";
import { SignUpResponse } from "@/types/SignUpResponse";
import { AddToCartResponse } from "@/components/interfaces/cart/AddToCartRespose";
import { IAddress } from "@/components/interfaces/IAddress";
import { ICart } from "@/components/interfaces/cart/ICart";
import { IUser } from "@/components/interfaces/IUser";

class ApiServices {
  #BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  #headers = {
    "Content-Type": "application/json",
  };

  #getAuthHeaders(token: string, includeContentType = false) {
    const normalizedToken = token.trim();

    return {
      ...(includeContentType ? this.#headers : {}),
      Authorization: `Bearer ${normalizedToken}`,
      token: normalizedToken,
    };
  }

  // Products
  async getProducts(): Promise<IProduct[]> {
    const response = await fetch(this.#BASE_URL + "/api/v1/products");
    const { data: products } = await response.json();
    return products;
  }
  async getProductDetails(productId: string): Promise<IProduct> {
    const response = await fetch(
      this.#BASE_URL + "/api/v1/products/" + productId,
    );
    const { data: product } = await response.json();
    return product;
  }

  // Categories
  async getCategories(): Promise<ICategory[]> {
    const response = await fetch(this.#BASE_URL + "/api/v1/categories");
    const { data: categories } = await response.json();
    return categories;
  }
  async getCategoryDetails(categoryId: string): Promise<ICategory> {
    const response = await fetch(
      this.#BASE_URL + "/api/v1/categories/" + categoryId,
    );
    const { data: category } = await response.json();
    return category;
  }

  // Brands
  async getBrands(): Promise<IBrand[]> {
    const response = await fetch(this.#BASE_URL + "/api/v1/brands");
    const { data: brands } = await response.json();
    return brands;
  }
  async getBrandDetails(brandId: string): Promise<IBrand> {
    const response = await fetch(this.#BASE_URL + "/api/v1/brands/" + brandId);
    const { data: brand } = await response.json();
    return brand;
  }

  // Wishlist
  async addProductToWishlist(
    productId: string,
    token: string,
  ): Promise<IWishlist> {
    const response = await fetch(this.#BASE_URL + "/api/v1/wishlist", {
      method: "POST",
      headers: this.#getAuthHeaders(token, true),
      body: JSON.stringify({ productId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to add product to wishlist.");
    }

    return result;
  }
  async removeProductFromWishlist(
    productId: string,
    token: string,
  ): Promise<IWishlist> {
    const response = await fetch(
      this.#BASE_URL + "/api/v1/wishlist/" + productId,
      {
        method: "DELETE",
        headers: this.#getAuthHeaders(token),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to remove product from wishlist.",
      );
    }

    return result;
  }

  // Authentication
  async signin(email: string, password: string): Promise<SignInResponse> {
    const response = await fetch(this.#BASE_URL + "/api/v1/auth/signin", {
      method: "POST",
      headers: this.#headers,
      body: JSON.stringify({ email, password }),
    });

    return (await response.json()) as SignInResponse;
  }
  async signup(
    name: string,
    email: string,
    password: string,
    rePassword: string,
    phone: string,
  ): Promise<SignUpResponse> {
    const response = await fetch(this.#BASE_URL + "/api/v1/auth/signup", {
      method: "POST",
      headers: this.#headers,
      body: JSON.stringify({
        name,
        email,
        password,
        rePassword,
        phone,
      }),
    });

    const result = (await response.json()) as SignUpResponse;

    if (!response.ok) {
      throw new Error(result.message || "Unable to sign up right now.");
    }

    return result;
  }
  async verifyToken(token?: string) {
    let resolvedToken = token;

    if (!resolvedToken) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      resolvedToken = cookieStore.get("next-auth.session-token")?.value;
    }

    if (!resolvedToken) {
      return { message: "No token found. Please login.", statusMsg: "fail" };
    }

    const response = await fetch(this.#BASE_URL + "/api/v1/auth/verifyToken", {
      headers: this.#getAuthHeaders(resolvedToken, true),
    });
    const result = await response.json();
    return result;
  }

  // Cart
  async addProductToCart(
    productId: string,
    token?: string,
  ): Promise<AddToCartResponse> {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to add products to your cart.");
    }

    const response = await fetch(this.#BASE_URL + "/api/v2/cart", {
      method: "POST",
      headers: this.#getAuthHeaders(resolvedToken, true),
      body: JSON.stringify({ productId }),
    });

    const result = (await response.json()) as AddToCartResponse;

    if (!response.ok) {
      throw new Error(result.message || "Unable to add product to cart.");
    }

    return result;
  }
  async getCart(token?: string): Promise<AddToCartResponse> {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to view your cart.");
    }

    const response = await fetch(this.#BASE_URL + "/api/v2/cart", {
      headers: this.#getAuthHeaders(resolvedToken),
    });

    const result = (await response.json()) as AddToCartResponse;

    if (response.status === 404) {
      return {
        status: "success",
        message: result.message || "Your cart is empty.",
        data: null,
        numOfCartItems: 0,
      };
    }

    if (!response.ok) {
      throw new Error(result.message || "Unable to load your cart.");
    }

    return result;
  }
  async updateCartItemQuantity(
    productId: string,
    count: number,
    token?: string,
  ): Promise<AddToCartResponse> {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to update your cart.");
    }

    const response = await fetch(this.#BASE_URL + "/api/v2/cart/" + productId, {
      method: "PUT",
      headers: this.#getAuthHeaders(resolvedToken, true),
      body: JSON.stringify({ count }),
    });

    const result = (await response.json()) as AddToCartResponse;

    if (!response.ok) {
      throw new Error(result.message || "Unable to update your cart.");
    }

    return result;
  }
  async removeCartItem(
    productId: string,
    token?: string,
  ): Promise<AddToCartResponse> {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to update your cart.");
    }

    const response = await fetch(this.#BASE_URL + "/api/v2/cart/" + productId, {
      method: "DELETE",
      headers: this.#getAuthHeaders(resolvedToken),
    });

    const result = (await response.json()) as AddToCartResponse;

    if (!response.ok) {
      throw new Error(result.message || "Unable to remove this item.");
    }

    return result;
  }
  async clearCart(token?: string): Promise<AddToCartResponse> {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to update your cart.");
    }

    const response = await fetch(this.#BASE_URL + "/api/v2/cart", {
      method: "DELETE",
      headers: this.#getAuthHeaders(resolvedToken),
    });

    const result = (await response.json()) as AddToCartResponse;

    if (!response.ok) {
      throw new Error(result.message || "Unable to clear your cart.");
    }

    return result;
  }
  #resolveToken(token?: string) {
    return (
      token ??
      (typeof window !== "undefined"
        ? (window.localStorage.getItem("token") ?? undefined)
        : undefined)
    );
  }

  // Orders
  async createCashOrderFromCart(
    address: IAddress,
    cart: ICart,
    token?: string,
  ) {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to place your order.");
    }

    const response = await fetch(
      this.#BASE_URL + "/api/v2/orders/" + cart._id,
      {
        method: "POST",
        headers: this.#getAuthHeaders(resolvedToken, true),
        body: JSON.stringify({
          shippingAddress: {
            details: address.details,
            phone: address.phone,
            city: address.city,
          },
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to place your order.");
    }

    return result;
  }
  async checkout(address: IAddress, cart: ICart, token?: string) {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to proceed to checkout.");
    }

    const checkoutUrl = `${this.#BASE_URL}/api/v1/orders/checkout-session/${encodeURIComponent(
      cart._id,
    )}?url=${encodeURIComponent("http://localhost:3000")}`;

    const response = await fetch(checkoutUrl, {
      method: "POST",
      headers: this.#getAuthHeaders(resolvedToken, true),
      body: JSON.stringify({
        shippingAddress: {
          details: address.details,
          phone: address.phone,
          city: address.city,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to proceed to checkout.");
    }

    return result;
  }
  async getUserOrders(user: IUser, token?: string) {
    let resolvedToken = this.#resolveToken(token);

    if (!resolvedToken && typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      resolvedToken = cookieStore.get("next-auth.session-token")?.value ?? undefined;
    }

    if (!resolvedToken) {
      throw new Error("Please sign in to view your orders.");
    }

    const response = await fetch(this.#BASE_URL + "/api/v1/orders/user/" + user._id, {
      headers: this.#getAuthHeaders(resolvedToken, true),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to load your orders.");
    }

    return result;
  }

  //Address
  async addAddress(
    name: string,
    details: string,
    phone: string,
    city: string,
    token?: string,
  ): Promise<IAddress> {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to add an address.");
    }

    const response = await fetch(this.#BASE_URL + "/api/v1/addresses", {
      method: "POST",
      headers: this.#getAuthHeaders(resolvedToken, true),
      body: JSON.stringify({
        name,
        details,
        phone,
        city,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to add address.");
    }

    return result;
  }
  async removeAddress(addressId: string, token?: string) {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to remove an address.");
    }

    const response = await fetch(
      this.#BASE_URL + "/api/v1/addresses/" + addressId,
      {
        method: "DELETE",
        headers: this.#getAuthHeaders(resolvedToken, true),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to remove address.");
    }

    return result;
  }
  async getSpecificAddress(addressId: string, token?: string) {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to fetch address.");
    }

    const response = await fetch(
      this.#BASE_URL + "/api/v1/addresses/" + addressId,
      {
        headers: this.#getAuthHeaders(resolvedToken, true),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to fetch address.");
    }

    return result;
  }
  async getLoggedUserAddresses(token?: string) {
    const resolvedToken = this.#resolveToken(token);

    if (!resolvedToken) {
      throw new Error("Please sign in to fetch addresses.");
    }

    const response = await fetch(this.#BASE_URL + "/api/v1/addresses", {
      headers: this.#getAuthHeaders(resolvedToken, true),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to fetch addresses.");
    }

    return result;
  }
}

export const apiServices = new ApiServices();
