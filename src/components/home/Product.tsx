import { apiServices } from "@/app/services/api";
import { IProduct } from "../interfaces/IProduct";
import ProductCard from "./ProductCardWithSession";

export default async function Product() {
  const products: IProduct[] = await apiServices.getProducts();

  return (
    <section className="bg-gray-50 py-8 antialiased dark:bg-gray-900 md:py-12">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: IProduct) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

