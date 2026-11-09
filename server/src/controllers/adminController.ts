import type { Request, Response } from 'express';
import type { ZodError } from 'zod';
import {
  hotelSchema,
  hotelUpdateSchema,
  roomTypeSchema,
  roomTypeUpdateSchema,
} from '../schemas/hotelSchemas';
import { findHotelById } from '../repositories/hotelRepository';
import {
  createHotel,
  createRoomType,
  addRoomTypeImages,
  deleteHotel,
  deleteHotelImage,
  deleteRoomType,
  deleteRoomTypeImage,
  updateHotel,
  updateRoomType,
} from '../repositories/adminHotelRepository';
import { removeUploadedFiles } from '../utils/files';
import { sendError } from '../utils/httpError';
import { uploadImages } from '../middleware/uploads';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function firstIssue(error: ZodError) {
  const issue = error.issues[0];
  return `${issue.path.join('.') || 'body'}: ${issue.message}`;
}

export async function createHotelHandler(req: Request, res: Response) {
  const parsed = hotelSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstIssue(parsed.error) });
    return;
  }
  try {
    const id = await createHotel(parsed.data);
    res.status(201).json(await findHotelById(id));
  } catch (err) {
    sendError(err, res);
  }
}

export async function updateHotelHandler(req: Request, res: Response) {
  const id = String(req.params.id);
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid hotel id' });
    return;
  }
  const parsed = hotelUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstIssue(parsed.error) });
    return;
  }
  try {
    if (!(await updateHotel(id, parsed.data))) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }
    res.json(await findHotelById(id));
  } catch (err) {
    sendError(err, res);
  }
}

export async function deleteHotelHandler(req: Request, res: Response) {
  const id = String(req.params.id);
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid hotel id' });
    return;
  }
  try {
    const imageUrls = await deleteHotel(id);
    if (imageUrls === null) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }
    await removeUploadedFiles(imageUrls);
    res.status(204).send();
  } catch (err) {
    sendError(err, res);
  }
}

export async function createRoomTypeHandler(req: Request, res: Response) {
  const hotelId = String(req.params.id);
  if (!UUID_REGEX.test(hotelId)) {
    res.status(400).json({ message: 'Invalid hotel id' });
    return;
  }
  const parsed = roomTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstIssue(parsed.error) });
    return;
  }
  try {
    const roomId = await createRoomType(hotelId, parsed.data);
    if (!roomId) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }
    res.status(201).json({ id: roomId });
  } catch (err) {
    sendError(err, res);
  }
}

export async function updateRoomTypeHandler(req: Request, res: Response) {
  const id = String(req.params.id);
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid room type id' });
    return;
  }
  const parsed = roomTypeUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstIssue(parsed.error) });
    return;
  }
  try {
    const hotelId = await updateRoomType(id, parsed.data);
    if (!hotelId) {
      res.status(404).json({ message: 'Room type not found' });
      return;
    }
    res.json(await findHotelById(hotelId));
  } catch (err) {
    sendError(err, res);
  }
}

export async function deleteRoomTypeHandler(req: Request, res: Response) {
  const id = String(req.params.id);
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid room type id' });
    return;
  }
  try {
    const imageUrls = await deleteRoomType(id);
    if (imageUrls === null) {
      res.status(404).json({ message: 'Room type not found' });
      return;
    }
    await removeUploadedFiles(imageUrls);
    res.status(204).send();
  } catch (err) {
    sendError(err, res);
  }
}

export async function uploadRoomTypeImagesHandler(req: Request, res: Response) {
  const roomTypeId = String(req.params.id);
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const urls = files.map((file) => `/uploads/${file.filename}`);
  const discardFiles = () => removeUploadedFiles(urls);

  if (!UUID_REGEX.test(roomTypeId)) {
    await discardFiles();
    res.status(400).json({ message: 'Invalid room type id' });
    return;
  }
  if (files.length === 0) {
    res.status(400).json({ message: 'No images uploaded. Use the field name "images".' });
    return;
  }
  try {
    const images = await addRoomTypeImages(roomTypeId, urls);
    if (images === null) {
      await discardFiles();
      res.status(404).json({ message: 'Room type not found' });
      return;
    }
    res.status(201).json(images);
  } catch (err) {
    await discardFiles();
    sendError(err, res);
  }
}

export async function deleteRoomTypeImageHandler(req: Request, res: Response) {
  const roomTypeId = String(req.params.id);
  const imageId = String(req.params.imageId);
  if (!UUID_REGEX.test(roomTypeId) || !UUID_REGEX.test(imageId)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    const url = await deleteRoomTypeImage(roomTypeId, imageId);
    if (!url) {
      res.status(404).json({ message: 'Room photo not found' });
      return;
    }
    await removeUploadedFiles([url]);
    res.status(204).send();
  } catch (err) {
    sendError(err, res);
  }
}

export async function deleteImageHandler(req: Request, res: Response) {
  const hotelId = String(req.params.id);
  const imageId = String(req.params.imageId);
  if (!UUID_REGEX.test(hotelId) || !UUID_REGEX.test(imageId)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    const url = await deleteHotelImage(hotelId, imageId);
    if (!url) {
      res.status(404).json({ message: 'Photo not found' });
      return;
    }
    await removeUploadedFiles([url]);
    res.status(204).send();
  } catch (err) {
    sendError(err, res);
  }
}
