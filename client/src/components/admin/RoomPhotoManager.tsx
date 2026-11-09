import { useState } from 'react';
import type { FormEvent } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { useFeedback } from '../ui/FeedbackProvider';
import { deleteRoomTypeImageRequest, uploadRoomTypeImagesRequest } from '../../services/api';
import { imageUrl } from '../../utils/imageUrl';
import { getErrorMessage } from '../../utils/errors';

const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  roomTypeId: string;
  roomName: string;
  images: { id: string; url: string }[];
  onChanged: () => void;
};

export default function RoomPhotoManager({ roomTypeId, roomName, images, onChanged }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [inputKey, setInputKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { confirm, notify } = useFeedback();

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (!files.length) return;
    if (files.some((file) => file.size > MAX_BYTES)) {
      setError('Each room photo must be 5 MB or smaller.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await uploadRoomTypeImagesRequest(roomTypeId, files);
      const count = files.length;
      setFiles([]);
      setInputKey((key) => key + 1);
      onChanged();
      notify(`${count} room photo${count === 1 ? '' : 's'} uploaded.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(imageId: string) {
    if (!await confirm({ title: 'Delete this room photo?', message: `This photo will be removed from ${roomName}.`, confirmLabel: 'Delete photo', destructive: true })) return;
    setError('');
    try {
      await deleteRoomTypeImageRequest(roomTypeId, imageId);
      onChanged();
      notify('Room photo deleted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <details className="room-photo-manager">
      <summary><ImagePlus size={16} /> Manage room photos <span>{images.length}</span></summary>
      {images.length > 0 ? <div className="photo-grid room-photo-grid">
        {images.map((image, index) => <div className="photo-item" key={image.id}>
          <img src={imageUrl(image.url)} alt={`${roomName} photo ${index + 1}`} loading="lazy" />
          <button type="button" aria-label={`Delete ${roomName} photo ${index + 1}`} onClick={() => handleDelete(image.id)}><Trash2 size={16} /></button>
        </div>)}
      </div> : <p className="summary-muted room-photo-empty">No photos yet. Add images so guests can see this room before booking.</p>}
      <form className="room-photo-upload" onSubmit={handleUpload}>
        <div className="field"><label htmlFor={`room-photos-${roomTypeId}`}>Choose photos (JPG, PNG or WEBP, up to 5 MB each)</label>
          <input key={inputKey} id={`room-photos-${roomTypeId}`} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
        </div>
        <Button type="submit" disabled={busy || files.length === 0}>{busy ? 'Uploading…' : 'Upload photos'}</Button>
      </form>
      {error && <p role="alert" className="form-error">{error}</p>}
    </details>
  );
}
