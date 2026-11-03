import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadHotelById } from "../store/slices/hotelsSlice";
import Breadcrumbs from "../components/layout/Breadcrumbs";
import RoomCard from "../components/hotel/RoomCard";
import Text from "../components/ui/Text";
import ImageGallery from "../components/hotel/ImageGallery";
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function HotelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: hotel, selectedStatus } = useAppSelector(
    (state) => state.hotels,
  );

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
        {hotel.city} · {"*".repeat(hotel.star_rating)}
      </p>

      <div className="details-grid">
        <ImageGallery images={hotel.images} alt={hotel.name} />

        <aside className="details-card">
          <h2>A stay made for slowing down</h2>
          {hotel.description && <p>{hotel.description}</p>}
          <ul className="checklist">
            {hotel.amenities.map((amenity) => (
              <li key={amenity}>✓ {amenity}</li>
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
        <div className="room-list">
          {hotel.room_types.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              actionLabel="Check availability"
              onSelect={() => navigate(`/hotels/${hotel.id}/book`)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
