import type { Hotel } from '../../types/hotel';
import Text from '../ui/Text';
import Button from '../ui/Button';

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="card">
      <div className="card-image">Photo</div>
      <div className="card-body">
        <Text variant="subheading">{hotel.name}</Text>
        <Text variant="caption">{hotel.city}, {hotel.country}</Text>
        <Text variant="caption">{'★'.repeat(hotel.star_rating)}</Text>
        {hotel.min_price && (<Text variant="body">From R{Number(hotel.min_price).toFixed(0)}/night</Text>)}
        <Button variant="secondary">View details</Button>
      </div>
    </div>
  );
}