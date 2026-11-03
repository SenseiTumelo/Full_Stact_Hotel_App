import type { Hotel } from "../../types/hotel";
import Text from "../ui/Text";
import { Link } from "react-router-dom";
import { imageUrl } from "../../utils/imageUrl";

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <article className="card">
      <div className="card-image">
        {hotel.cover_image ? (
          <img src={imageUrl(hotel.cover_image)} alt="" loading="lazy" />
        ) : (
          "Photo"
        )}
      </div>
      <div className="card-body">
        <Text variant="subheading">{hotel.name}</Text>
        <Text variant="caption">
          {hotel.city} · {"*".repeat(hotel.star_rating)}
        </Text>
        {hotel.min_price && (
          <Text variant="body">
            <strong>R{Number(hotel.min_price).toFixed(0)}</strong> / night
          </Text>
        )}
        <Link to={`/hotels/${hotel.id}`} className="btn btn-secondary">
          View stay
        </Link>
      </div>
    </article>
  );
}