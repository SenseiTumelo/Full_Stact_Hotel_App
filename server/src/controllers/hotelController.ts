import { Request, Response } from 'express';
import { findAllHotels } from '../repositories/hotelRepository';

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