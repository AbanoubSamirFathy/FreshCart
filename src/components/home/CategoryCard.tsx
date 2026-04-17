import { apiServices } from "@/app/services/api";
import { ICategory } from "@/components/interfaces/ICategory";
import Link from "next/link";
import { getCategoryDetailsRoute } from "@/lib/routes";

export default async function CategoryCard() {
  const categories: ICategory[] = await apiServices.getCategories();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {categories.map((category: ICategory) => (
        <div key={category._id}>
          <Link
            href={getCategoryDetailsRoute(category._id)}
            className="block cursor-pointer rounded-2xl p-3 text-center shadow-xl"
          >
            <img
              src={category.image}
              alt="category-img"
              className="m-auto h-20 w-20 rounded-full"
            />
            <p>{category.name}</p>
          </Link>
        </div>
      ))}
    </div>
  );
}
