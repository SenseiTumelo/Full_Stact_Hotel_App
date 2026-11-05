export type Hotel = {
  id: string;
  name: string;
  city: string;
  country: string;
  star_rating: number;
  min_price: string | null; //this is a string instead of a number because postgresql send numeric values as text.
  cover_image: string | null;
};

export type RoomType = {
  id: string;
  name: string;
  capacity: number;
  price_per_night: string;
  currency: string;
  description: string | null;
  total_rooms: number;
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
  amenity_ids: number[];
};

export type Amenity = { id: number; name: string };

export type HotelInput = {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  starRating: number;
  policies: string;
  amenityIds: number[];
};

export type RoomTypeInput = {
  name: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  totalRooms: number;
};