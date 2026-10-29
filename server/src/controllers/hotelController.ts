import { Request, Response } from 'express';
import { findAllHotels, findHotelById } from '../repositories/hotelRepository';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getHotelById(req: Request, res: Response) {
  const id = String(req.params.id);

  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid hotel id' });
    return;
  }

  try {
    const hotel = await findHotelById(id);

    if (!hotel) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }

    res.json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getHotels(req: Request, res: Response) {
  try {
    const { city, minStars, maxPrice } = req.query;

    const hotels = await findAllHotels({
      city: typeof city === 'string' ? city : undefined,
      minStars: minStars ? Number(minStars) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    res.json(hotels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}