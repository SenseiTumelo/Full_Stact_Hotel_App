import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadHotelById } from "../store/slices/hotelsSlice";
import Breadcrumbs from "../components/layout/Breadcrumbs";
import RoomCard from "../components/hotel/RoomCard";
import Text from "../components/ui/Text";
import ImageGallery from "../components/hotel/ImageGallery";
import { Link, useNavigate, useParams } from 'react-router-dom';
   import ReviewSection from '../components/review/ReviewSection';
   import StarRating from '../components/ui/StarRating';
import { BedDouble, Check, MapPin, Star } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

export default function HotelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: hotel, selectedStatus } = useAppSelector(
    (state) => state.hotels,
  );
     const reviews = useAppSelector((state) => state.reviews);

  useEffect(() => {
    if (id) dispatch(loadHotelById(id));
  }, [id, dispatch]);

  if (selectedStatus === "idle" || selectedStatus === "loading") {
    return (
      <main className="container section">
        <Text>Loading...</Text>
      </main>
    );
  }

  if (selectedStatus === "failed" || !hotel) {
    return (
      <main className="container section">
        <Text variant="heading">Hotel not found</Text>
        <p>
          <Link to="/">Back to all stays</Link>
        </p>
      </main>
    );
  }

  const cheapest = hotel.room_types[0]; // the API sorts rooms by price, lowest first

  return (
    <main className="container section">
      <Breadcrumbs
        items={[
          { label: "Hotels", to: "/" },
          { label: hotel.city },
          { label: hotel.name },
        ]}
      />
      <h1 className="page-title">{hotel.name}</h1>
   <p className="page-subtitle">
     <span className="hotel-location"><MapPin size={15} /> {hotel.city}</span>
     <span className="hotel-star-badge">{Array.from({ length: hotel.star_rating }, (_, index) => <Star key={index} size={13} fill="currentColor" />)} {hotel.star_rating}-star stay</span>
     {reviews.hotelId === hotel.id && reviews.count > 0 && (
       <>
         {' · '}
         <StarRating value={reviews.average} /> {reviews.average.toFixed(1)} ({reviews.count})
       </>
     )}
   </p>

      <div className="details-grid">
        <ImageGallery images={hotel.images} alt={hotel.name} />

        <aside className="details-card">
          <h2>A stay made for slowing down</h2>
          {hotel.description && <p>{hotel.description}</p>}
          <ul className="checklist">
            {hotel.amenities.map((amenity) => (
              <li key={amenity}><span className="amenity-check"><Check size={13} /></span>{amenity}</li>
            ))}
          </ul>
          {cheapest && (
            <p>
              From{" "}
              <strong className="price">
                R{Number(cheapest.price_per_night).toLocaleString("en-ZA")}
              </strong>{" "}
              / night
            </p>
          )}
          <Link to={`/hotels/${hotel.id}/book`} className="btn btn-primary">
            Choose your dates
          </Link>
        </aside>
      </div>

      <section style={{ marginTop: 48 }}>
        <h2 className="section-title">Choose a room</h2>
        {hotel.room_types.length === 0 ? <EmptyState icon={BedDouble} title="No rooms are listed yet" description="This property is not accepting room bookings at the moment."><Link to="/" className="btn btn-secondary">Explore other stays</Link></EmptyState> : <div className="room-list">
          {hotel.room_types.map((room) => <RoomCard key={room.id} room={room} actionLabel="Check availability" onSelect={() => navigate(`/hotels/${hotel.id}/book`)} />)}
        </div>}
      </section>
         <ReviewSection hotelId={hotel.id} />
    </main>
  );
}
