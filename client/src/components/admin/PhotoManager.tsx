import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import { deleteHotelImageRequest, uploadHotelImagesRequest } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';
import { imageUrl } from '../../utils/imageUrl';
import { useFeedback } from '../ui/FeedbackProvider';
import { ImagePlus, Trash2 } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

const MAX_BYTES = 5 * 1024 * 1024;

type PhotoManagerProps = {
  hotelId: string;
  images: { id: string; url: string }[];
  onChanged: () => void;
};

export default function PhotoManager({ hotelId, images, onChanged }: PhotoManagerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [inputKey, setInputKey] = useState(0); // changing the key empties the file input
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { confirm, notify } = useFeedback();

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (files.length === 0) return;
    if (files.some((file) => file.size > MAX_BYTES)) {
      setError('Each photo must be 5 MB or smaller.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await uploadHotelImagesRequest(hotelId, files);
      setFiles([]);
      setInputKey((key) => key + 1);
      onChanged();
      notify(`${files.length} photo${files.length === 1 ? '' : 's'} uploaded.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(imageId: string) {
    if (!await confirm({ title: 'Delete this photo?', message: 'This image will be removed from the property gallery.', confirmLabel: 'Delete photo', destructive: true })) return;
    setError('');
    try {
      await deleteHotelImageRequest(hotelId, imageId);
      onChanged();
      notify('Photo deleted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="admin-section" aria-labelledby="photos-heading">
      <h2 id="photos-heading">Photos</h2>

      {images.length === 0 ? (
        <EmptyState compact icon={ImagePlus} title="No property photos yet" description="Upload a few clear photos. The first image becomes the hotel cover." />
      ) : (
        <div className="photo-grid">
          {images.map((image, index) => (
            <div key={image.id} className="photo-item">
              <img src={imageUrl(image.url)} alt={`Hotel photo ${index + 1}`} loading="lazy" />
              <button
                type="button"
                aria-label={`Delete photo ${index + 1}`}
                onClick={() => handleDelete(image.id)}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleUpload} className="upload-row">
        <div className="field">
          <label htmlFor="photos">Add photos (jpg, png or webp, up to 5 megabytes each)</label>
          <input
            key={inputKey}
            id="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </div>
        <Button type="submit" disabled={busy || files.length === 0}>
          {busy ? 'Uploading...' : 'Upload'}
        </Button>
      </form>

      {error && <p role="alert" className="form-error">{error}</p>}
    </section>
  );
}
