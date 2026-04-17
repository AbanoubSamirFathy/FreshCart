import { notFound } from "next/navigation";
import ProductCard from "@/components/home/ProductCardWithSession";
import { apiServices } from "../../services/api";

export default async function CategoryDetails({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const categoryData = await Promise.all([
    apiServices.getCategoryDetails(categoryId),
    apiServices.getProducts(),
  ]).catch(() => null);

  if (!categoryData) {
    notFound();
  }

  const [category, products] = categoryData;
  const categoryProducts = products.filter(
    (product) => product.category._id === categoryId,
  );

  return (
    <div>
      <div className="bg-green-400">
        <div className="px-30 mx-auto pt-32 pb-10">
          <div className="flex gap-3 items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white shadow-2xl">
              <img
                src={category.image}
                alt={category.name}
                className="object-contain h-20 w-20"
              />
            </div>
            <div>
              <h2 className="font-extrabold text-4xl text-white">
                {category.name}
              </h2>
              <p className="text-white text-sm">
                Explore products from {category.name}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-5 px-30 text-black text-lg">
        Showing {categoryProducts.length} product
        {categoryProducts.length === 1 ? "" : "s"}
      </p>
      {categoryProducts.length ? (
        <div className="px-30 pb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categoryProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mx-30 mt-4 mb-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-600">
          No products are available for this category right now.
        </div>
      )}
    </div>
  );
}
