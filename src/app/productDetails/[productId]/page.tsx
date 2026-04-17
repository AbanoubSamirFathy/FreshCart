import AddToCartButton from "@/components/cart/AddToCartButton";
import DateFormatter from "@/components/home/DateFormatter";
import { IProduct } from "@/components/interfaces/IProduct";
import { apiServices } from "../../services/api";
import AddToFavoriteButton from "@/components/cart/AddToFavoriteButton";

const TOTAL_STARS = 5;

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

function getStarType(rating: number, starNumber: number) {
  if (rating >= starNumber) {
    return "full";
  }

  if (rating >= starNumber - 0.5) {
    return "half";
  }

  return "empty";
}

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await apiServices.getProductDetails(productId);
  const discounted = hasDiscount(product);
  const mainImage = product.imageCover || product.images?.[0] || "";

  return (
    <main className="pb-12 pt-30">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-130 w-130 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border p-3">
            <img
              src={mainImage}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {discounted ? (
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

            <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {product.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
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
                        className="absolute inset-0 h-4 w-4 text-slate-200"
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
              <span className="text-sm font-medium text-slate-700">
                {product.ratingsAverage ?? 0}
              </span>
              <span className="text-sm text-slate-500">
                ({product.ratingsQuantity ?? 0} reviews)
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {discounted ? (
                <>
                  <p className="text-3xl font-extrabold text-green-700">
                    {formatPrice(product.priceAfterDiscount)} EGP
                  </p>
                  <span className="text-lg text-slate-400 line-through">
                    {formatPrice(product.price)} EGP
                  </span>
                </>
              ) : (
                <p className="text-3xl font-extrabold text-slate-900">
                  {formatPrice(product.price)} EGP
                </p>
              )}
            </div>

            <div className="mt-6 max-w-3xl text-sm leading-7 text-slate-600">
              {product.description}
            </div>

            <div className="mb-3">
              <div className="rounded-2xl border border-slate-950 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Brand
                </p>
                <p className="mt-2 font-semibold text-slate-900">
                  {product.brand?.name ?? "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <AddToCartButton
                className="rounded-xl bg-green-600 px-6 py-3 text-md font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                productId={product._id}
              >
                <i className="fa-solid fa-plus me-2"></i> Add to cart
              </AddToCartButton>
              {/* <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-md font-semibold text-slate-900 transition hover:bg-slate-50 hover:text-red-500"
                
              >
                <i className="fa-solid fa-heart me-2"></i> Add to favorites
              </button> */}
              <AddToFavoriteButton
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-md font-semibold text-slate-900 transition hover:bg-slate-50 hover:text-red-500"
                productId={product._id}
              >
                <i className="fa-solid fa-heart me-2"></i> Add to favorites
              </AddToFavoriteButton>
            </div>
          </div>
        </div>
        <div>
          <div className="my-3">
            <div className="rounded-2xl border border-slate-950 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Reviews ({product.reviews.length})
              </p>
            </div>
          </div>
          {product.reviews.map((review) => (
            <div
              key={review._id}
              className="my-5 flex items-center gap-10 rounded-2xl border border-slate-950 bg-slate-50 p-4"
            >
              <div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center">
                    {Array.from({ length: TOTAL_STARS }, (_, index) => {
                      const rating = review.rating ?? 0;
                      const starType = getStarType(rating, index + 1);

                      return (
                        <div
                          key={`${product._id}-review-star-${index}`}
                          className="relative h-4 w-4"
                        >
                          <svg
                            className="absolute inset-0 h-4 w-4 text-slate-200"
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
                </div>
                <p className="text-lg font-bold text-black">
                  {review.user.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-black">Created At:</p>
                  <p className="text-sm text-gray-500">
                    <DateFormatter dateString={review.createdAt} />
                  </p>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-black">Updated At:</p>
                  <p className="text-sm text-gray-500">
                    <DateFormatter dateString={review.updatedAt} />
                  </p>
                </div>
              </div>
              <div className="text-gray-500">
                <p>{review.review}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
