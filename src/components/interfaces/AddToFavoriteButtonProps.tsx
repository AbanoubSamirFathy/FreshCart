import { IProduct } from "./IProduct";

export interface AddToFavoriteButtonProps {
  product?: IProduct;
  productId?: string;
  children?: React.ReactNode;
  className?: string;
}
