import { ICart } from "./ICart";

export interface AddToCartResponse {
  status: string;
  message: string;
  numOfCartItems?: number;
  cartId?: string;
  data?: ICart | null;
}