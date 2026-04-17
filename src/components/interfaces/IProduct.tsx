import { ISubcategory } from "./ISubcategory";
import { ICategory } from "./ICategory";
import { IBrand } from "./IBrand";
import { IReview } from "./IReview";

export interface IProduct {
  sold: number | null;
  images: string[];
  subcategory: ISubcategory[];
  ratingsQuantity: number;
  _id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  price: number;
  priceAfterDiscount: number;
  imageCover: string;
  category: ICategory;
  brand: IBrand;
  ratingsAverage: number;
  reviews: IReview[];
  createdAt: string;
  updatedAt: string;
  id: string;
}
