import type { Hotel } from "../../types/hotel";
import Text from "../ui/Text";
import { Link } from "react-router-dom";
import { imageUrl } from "../../utils/imageUrl";
import StarRating from "../ui/StarRating";
import { ArrowUpRight, BedDouble, MapPin, Star } from 'lucide-react';

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <article className="card">
      <div className="card-image">
        {hotel.cover_image ? (
          <img src={imageUrl(hotel.cover_image)} alt="" loading="lazy" />
        ) : (
          <span className="card-image-empty"><BedDouble size={28} /><span>Stay preview</span></span>
        )}
      </div>
      <div className="card-body">
        <Text variant="subheading">{hotel.name}</Text>
        <div className="hotel-card-meta"><span><MapPin size={14} /> {hotel.city}</span><span><Star size={14} fill="currentColor" /> {hotel.star_rating}-star</span></div>
        {hotel.review_count > 0 && (
  <Text variant="caption">
    <StarRating value={Number(hotel.avg_rating)} /> {hotel.avg_rating} ({hotel.review_count})
  </Text>
)}
        <div className="hotel-card-bottom">
          <Text variant="body">
            {hotel.min_price ? <><strong>R{Number(hotel.min_price).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}</strong><span className="per-night"> / night</span></> : <span className="summary-muted">Rates unavailable</span>}
          </Text>
        <Link to={`/hotels/${hotel.id}`} className="hotel-card-link" aria-label={`View ${hotel.name}`}>
          View stay <ArrowUpRight size={17} />
        </Link>
        </div>
      </div>
    </article>
  );
}
