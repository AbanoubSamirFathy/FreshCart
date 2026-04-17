export interface ICartProduct {
  _id: string;
  title: string;
  imageCover: string;
  category?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
  ratingsAverage?: number;
  price: number;
}