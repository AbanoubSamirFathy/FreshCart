import { ICartItem } from "./ICartItem";

export interface ICart {
  _id: string;
  cartOwner: string;
  products: ICartItem[];
  totalCartPrice: number;
}