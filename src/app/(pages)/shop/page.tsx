import Product from "@/components/home/Product";
import { IProduct } from "@/components/interfaces/IProduct";
import { apiServices } from "../../services/api";

export default async function Shop() {
  const products: IProduct[] = await apiServices.getProducts();
  return (
    <div>
      <div className="bg-green-400">
        <div className="px-30 mx-auto pt-32 pb-10">
          <div className="flex gap-3 items-center">
            <div className="bg-white text-green-600 p-4 text-2xl rounded-xl shadow-2xl">
              <i className="fa-solid fa-box-open"></i>
            </div>
            <div>
              <h2 className="font-extrabold text-4xl text-white">
                All Products
              </h2>
              <p className="text-white text-sm">
                Explore our complete product collection
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-5 -mb-8 px-30 text-gray-800 text-lg">
        Showing {products.length} products
      </p>
      <Product />
    </div>
  );
}
