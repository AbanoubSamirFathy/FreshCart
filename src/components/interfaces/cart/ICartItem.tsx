import { ICartProduct } from "./ICartProduct";

export interface ICartItem {
  _id: string;
  count: number;
  price: number;
  product: ICartProduct;
}