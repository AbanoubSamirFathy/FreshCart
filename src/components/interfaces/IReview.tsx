import { IUser } from "./IUser";

export interface IReview {
  _id: string;
  review: string;
  rating: number;
  product: string;
  user: IUser;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
