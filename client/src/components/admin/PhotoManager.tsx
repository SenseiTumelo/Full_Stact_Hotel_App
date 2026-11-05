import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import { deleteHotelImageRequest, uploadHotelImagesRequest } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';
import { imageUrl } from '../../utils/imageUrl';

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
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(imageId: string) {
    if (!window.confirm('Delete this photo?')) return;
    setError('');
    try {
      await deleteHotelImageRequest(hotelId, imageId);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="admin-section" aria-labelledby="photos-heading">
      <h2 id="photos-heading">Photos</h2>

      {images.length === 0 ? (
        <p className="summary-muted">No photos yet. The first photo you upload becomes the cover image.</p>
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
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleUpload} className="upload-row">
        <div className="field">
          <label htmlFor="photos">Add photos (JPG, PNG or WEBP, up to 5 MB each)</label>
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