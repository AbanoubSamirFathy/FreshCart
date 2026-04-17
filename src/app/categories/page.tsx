import { apiServices } from "../services/api";
import Link from "next/link";
import { getCategoryDetailsRoute } from "@/lib/routes";

export default async function Categories() {
  const categories = await apiServices.getCategories();
  return (
    <div>
      <div className="bg-green-400">
        <div className="px-30 mx-auto pt-32 pb-10">
          <div className="flex gap-3 items-center">
            <div className="bg-white text-green-600 p-4 text-2xl rounded-xl shadow-2xl">
              <i className="fa-solid fa-tags"></i>
            </div>
            <div>
              <h2 className="font-extrabold text-4xl text-white">All Categories</h2>
              <p className="text-white text-sm">
                Shop from your favorite categories
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-5 mb-5 px-30 text-gray-800 text-lg">
        Showing {categories.length} categories
      </p>
      <div className="px-30 pb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={getCategoryDetailsRoute(category._id)}
            className="gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div>
              <img
                className="text-gray-500 object-contain h-50 w-full"
                src={category.image}
                alt={category.name}
              />
              <h3 className="text-xl font-bold text-gray-900 text-center">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
