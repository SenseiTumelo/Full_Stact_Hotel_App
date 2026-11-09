import { Request, Response } from 'express';
import { findAllHotels, findHotelById, hotelExists, addHotelImages, findAllAmenities } from '../repositories/hotelRepository';
import { removeUploadedFiles, saveUploadedFiles } from '../middleware/uploads';

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

export async function uploadHotelImages(req: Request, res: Response) {
  const id = String(req.params.id);
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid hotel id' });
    return;
  }
  if (files.length === 0) {
    res.status(400).json({ message: 'No images uploaded. Use the field name "images".' });
    return;
  }

  try {
    if (!(await hotelExists(id))) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }

    const urls = await saveUploadedFiles(files);
    const images = await addHotelImages(id, urls);
    res.status(201).json(images);
  } catch (err) {
    await removeUploadedFiles(files.map((f) => `/uploads/${f.filename}`).filter((url) => !url.endsWith('/undefined')));
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getAmenities(_req: Request, res: Response) {
  try {
    res.json(await findAllAmenities());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
