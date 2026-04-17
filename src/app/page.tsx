import CategoryCard from "@/components/home/CategoryCard";
import HeroCarousel from "@/components/home/HeroCarousel";
import Product from "@/components/home/Product";

export default async function Home() {
  return (
    <main className="pt-18.5 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-screen-xl py-5">
        <HeroCarousel />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-3 justify-between py-5">
          <div className="flex gap-2 p-4 rounded-2xl shadow-xl">
            <div className="bg-blue-200 text-blue-600 p-3 rounded-full text-lg">
              <i className="fa-solid fa-truck"></i>
            </div>
            <div>
              <p className="font-bold">Free Shopping</p>
              <p className="text-sm text-gray-500">On orders over 500 EGP</p>
            </div>
          </div>
          <div className="flex gap-2 p-4 rounded-2xl shadow-xl">
            <div className="bg-green-200 text-green-600 p-3 rounded-full text-lg">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <p className="font-bold">Secure Payment</p>
              <p className="text-sm text-gray-500">100% secure transactions</p>
            </div>
          </div>
          <div className="flex gap-2 p-4 rounded-2xl shadow-xl">
            <div className="bg-orange-200 text-orange-600 p-3 rounded-full text-lg">
              <i className="fa-solid fa-arrow-rotate-left"></i>
            </div>
            <div>
              <p className="font-bold">Easy returns</p>
              <p className="text-sm text-gray-500">14-day return policy</p>
            </div>
          </div>
          <div className="flex gap-2 p-4 rounded-2xl shadow-xl">
            <div className="bg-blue-200 text-violet-600 p-3 rounded-full text-lg">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div>
              <p className="font-bold">24/7 Support</p>
              <p className="text-sm text-gray-500">Dedicated support team</p>
            </div>
          </div>
        </div>

        {/* Shop By Category */}
        <div className="py-5">
          <h2 className="font-bold text-2xl">
            Shop By <span className="text-green-600">Category</span>
          </h2>
          <CategoryCard/>
        </div>

        {/* Featured Products */}
        <div className="py-5">
          <h2 className="font-bold text-2xl -mb-8">
            Featured <span className="text-green-600">Products</span>
          </h2>
          <Product />
        </div>
      </div>
    </main>
  );
}
