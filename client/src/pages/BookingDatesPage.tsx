import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHotelById } from '../store/slices/hotelsSlice';
import { loadAvailability, setDraft } from '../store/slices/bookingSlice';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import StepIndicator from '../components/bookings/StepIndicator';
import RoomCard from '../components/hotel/RoomCard';
import Text from '../components/ui/Text';
import type { RoomType } from '../types/hotel';
import { nightsBetween, todayIso } from '../utils/booking';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value) || min));

export default function BookingDatesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selected: hotel, selectedStatus } = useAppSelector((state) => state.hotels);
  const { availability, availabilityStatus } = useAppSelector((state) => state.booking);

  const today = todayIso();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);

  const datesValid =
    checkIn >= today && checkOut > checkIn && nightsBetween(checkIn, checkOut) <= 30;

  useEffect(() => {
    if (id) dispatch(loadHotelById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (id && datesValid) dispatch(loadAvailability({ hotelId: id, checkIn, checkOut }));
  }, [id, checkIn, checkOut, datesValid, dispatch]);

  if (selectedStatus === 'failed') {
    return (
      <main className="container section">
        <Text variant="heading">Hotel not found</Text>
        <p><Link to="/">Back to all stays</Link></p>
      </main>
    );
  }
  if (!hotel || hotel.id !== id) {
    return <main className="container section"><Text>Loading...</Text></main>;
  }

  const roomsLeft = (roomId: string) =>
    availability.find((item) => item.room_type_id === roomId)?.available ?? 0;

  function selectRoom(room: RoomType) {
    if (!hotel) return;
    dispatch(
      setDraft({
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomTypeId: room.id,
        roomName: room.name,
        pricePerNight: room.price_per_night,
        checkIn,
        checkOut,
        rooms,
        guests,
      })
    );
    navigate('/booking/details');
  }

  function roomState(room: RoomType): { disabled: boolean; note?: string } {
    if (!datesValid) return { disabled: true, note: 'Choose your dates first' };
    if (availabilityStatus !== 'succeeded') return { disabled: true };

    const left = roomsLeft(room.id);
    if (left === 0) return { disabled: true, note: 'Sold out for these dates' };
    if (left < rooms) return { disabled: true, note: `Only ${left} left` };
    if (guests > room.capacity * rooms) {
      return { disabled: true, note: `Sleeps ${room.capacity} per room` };
    }
    return { disabled: false, note: left <= 3 ? `Only ${left} left` : undefined };
  }

  return (
    <main className="container section">
      <Breadcrumbs
        items={[
          { label: 'Hotels', to: '/' },
          { label: hotel.name, to: `/hotels/${hotel.id}` },
          { label: 'Dates & rooms' },
        ]}
      />
      <h1 className="page-title">Choose your dates and room</h1>
      <p className="page-subtitle">{hotel.name} · {hotel.city}</p>

      <StepIndicator current={1} />

      <form className="search-bar" onSubmit={(event) => event.preventDefault()}>
        <div className="field">
          <label htmlFor="checkIn">Check-in</label>
          <input
            id="checkIn"
            type="date"
            min={today}
            value={checkIn}
            onChange={(event) => {
              setCheckIn(event.target.value);
              if (checkOut && event.target.value >= checkOut) setCheckOut('');
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="checkOut">Check-out</label>
          <input
            id="checkOut"
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="rooms">Rooms</label>
          <input
            id="rooms"
            type="number"
            min={1}
            max={10}
            value={rooms}
            onChange={(event) => setRooms(clamp(Number(event.target.value), 1, 10))}
          />
        </div>
        <div className="field">
          <label htmlFor="guests">Guests</label>
          <input
            id="guests"
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(event) => setGuests(clamp(Number(event.target.value), 1, 20))}
          />
        </div>
      </form>

      <div style={{ margin: '16px 0' }} aria-live="polite">
        {!datesValid && (
          <Text variant="caption">Pick a check-in and check-out date (up to 30 nights) to see what is available.</Text>
        )}
        {datesValid && availabilityStatus === 'loading' && <Text variant="caption">Checking availability...</Text>}
        {datesValid && availabilityStatus === 'failed' && (
          <Text variant="caption">Could not check availability. Please try again.</Text>
        )}
      </div>

      <div className="room-list">
        {hotel.room_types.map((room) => {
          const state = roomState(room);
          return (
            <RoomCard
              key={room.id}
              room={room}
              actionLabel="Select room"
              onSelect={() => selectRoom(room)}
              disabled={state.disabled}
              note={state.note}
            />
          );
        })}
      </div>
    </main>
  );
}