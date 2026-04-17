import { apiServices } from "@/app/services/api";
import ProductCard from "@/components/home/ProductCard";
import { IProduct } from "@/components/interfaces/IProduct";

export default async function Electronics() {
  const products: IProduct[] = await apiServices.getProducts();
  const electronicsProducts = products.filter(
    (product) => product.category.name === "Electronics"
  );

  return (
    <div>
      <div className="bg-green-400">
        <div className="px-30 mx-auto pt-32 pb-10">
          <div className="flex gap-3 items-center">
            <div className="bg-white text-green-600 p-4 text-2xl rounded-xl shadow-2xl">
              <i className="fa-solid fa-tags"></i>
            </div>
            <div>
              <h2 className="font-extrabold text-4xl text-white">
                Electronics Category
              </h2>
              <p className="text-white text-sm">
                Shop from electronics category
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-5 mb-5 px-30 text-gray-800 text-lg">
        Showing {electronicsProducts.length} products
      </p>
      <div className="px-30 pb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {electronicsProducts.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <p className="text-gray-500 text-lg">No products found in this category</p>
          </div>
        ) : (
          electronicsProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}
