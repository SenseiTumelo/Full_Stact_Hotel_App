export type Hotel = {
  id: string;
  name: string;
  city: string;
  country: string;
  star_rating: number;
  min_price: string | null; //this is a string instead of a number because postgresql send numeric values as text.
};