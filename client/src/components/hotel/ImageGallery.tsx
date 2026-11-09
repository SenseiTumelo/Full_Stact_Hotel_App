import { useState } from 'react';
import { imageUrl } from '../../utils/imageUrl';
import { Images } from 'lucide-react';

type ImageGalleryProps = {
  images: { id: string; url: string }[];
  alt: string;
};

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="gallery-main gallery-empty"><div><Images size={28} /><span>Property photos coming soon</span></div></div>;
  }

  const current = images[active];

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={imageUrl(current.url)} alt={`${alt}, photo ${active + 1} of ${images.length}`} />
        <span className="gallery-count">{active + 1} / {images.length}</span>
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={index === active ? 'thumb thumb-active' : 'thumb'}
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === active}
            >
              <img src={imageUrl(image.url)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
