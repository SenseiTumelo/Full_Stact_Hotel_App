export type Hotel = {
  id: string;
  name: string;
  city: string;
  country: string;
  star_rating: number;
  min_price: string | null; //this is a string instead of a number because postgresql send numeric values as text.
};

export type RoomType = {
  id: string;
  name: string;
  capacity: number;
  price_per_night: string;
  currency: string;
  description: string | null;
};

export type HotelDetails = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  star_rating: number;
  policies: string | null;
  images: { id: string; url: string }[];
  amenities: string[];
  room_types: RoomType[];
};