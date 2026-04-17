import { notFound } from "next/navigation";
import ProductCard from "@/components/home/ProductCardWithSession";
import { apiServices } from "../../services/api";

export default async function BrandDetails({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const brandData = await Promise.all([
    apiServices.getBrandDetails(brandId),
    apiServices.getProducts(),
  ]).catch(() => null);

  if (!brandData) {
    notFound();
  }

  const [brand, products] = brandData;
  const brandProducts = products.filter(
    (product) => product.brand._id === brandId,
  );

  return (
    <div>
      <div className="bg-green-400">
        <div className="px-30 mx-auto pt-32 pb-10">
          <div className="flex gap-3 items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white shadow-2xl">
              <img
                src={brand.image}
                alt={brand.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-extrabold text-4xl text-white">
                {brand.name}
              </h2>
              <p className="text-white text-sm">
                Explore products from {brand.name}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-5 px-30 text-black text-lg">
        Showing {brandProducts.length} product
        {brandProducts.length === 1 ? "" : "s"}
      </p>
      {brandProducts.length ? (
        <div className="px-30 pb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {brandProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-600">
          No products are available for this brand right now.
        </div>
      )}
    </div>
  );
}
