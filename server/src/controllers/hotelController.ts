import { Request, Response } from 'express';
import { findAllHotels } from '../repositories/hotelRepository';

export async function getHotels(req: Request, res: Response) {
try{
    const hotels = await findAllHotels();
    res.json(hotels);
} catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something wen wrong'});
}
}